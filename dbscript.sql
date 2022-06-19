create or replace table accounts
(
    ID        int auto_increment,
    Email     varchar(256) not null,
    FirstName varchar(256) null,
    LastName  varchar(256) null,
    Password  varchar(256) not null,
    constraint Accounts_UK_Email
        unique (Email),
    constraint Accounts_UK_ID
        unique (ID)
);

alter table accounts
    add primary key (ID);

create or replace table bottles
(
    ID              int auto_increment
        primary key,
    Name            varchar(256)                         null,
    Price           decimal                              null,
    Country         char(2)                              null,
    Label           varchar(512)                         null,
    ImageUrl        varchar(1024)                        null,
    InputDateTime   datetime default current_timestamp() null,
    CreatedDateTime datetime                             null
);

create or replace table collections
(
    ID            int auto_increment
        primary key,
    Name          varchar(256)                         not null,
    InputDateTime datetime default current_timestamp() not null,
    Description   varchar(1024)                        null
);

create or replace table account2collections
(
    CollectionID int null,
    AccountID    int null,
    constraint Account2Collections_FK_AccountID
        foreign key (AccountID) references accounts (ID)
            on update cascade on delete cascade,
    constraint Account2Collections_FK_CollectionID
        foreign key (CollectionID) references collections (ID)
            on update cascade on delete cascade
);

create or replace table collection2bottles
(
    ID           int auto_increment,
    CollectionID int not null,
    BottleID     int not null,
    primary key (CollectionID, BottleID),
    constraint collection2bottles_ID_uindex
        unique (ID),
    constraint Collection2Bottles_FK_BottleID
        foreign key (BottleID) references bottles (ID)
            on update cascade on delete cascade,
    constraint Collection2Bottles_FK_CollectionID
        foreign key (CollectionID) references collections (ID)
            on update cascade on delete cascade
);

create or replace
    definer = root@localhost procedure AccountLogin(IN in_email varchar(256), IN in_password varchar(256))
begin
    select ID, Email, FirstName, LastName from accounts where Email = in_email and Password = in_password;
end;

create or replace
    definer = root@localhost procedure AccountRegister(IN in_email varchar(256), IN in_firstName varchar(256),
                                                       IN in_lastName varchar(256), IN in_password varchar(256))
begin
    insert into accounts (Email, FirstName, LastName, Password) VALUE (in_email, in_firstName, in_lastName, in_password);
end;

create or replace
    definer = root@localhost procedure BottleAdd(IN in_name varchar(256), IN in_price decimal, IN in_country char(2),
                                                 IN in_label varchar(512), IN in_imageUrl varchar(512),
                                                 IN in_createdDateTime datetime)
begin
    insert into bottles (Name, Price, Country, Label, ImageUrl, CreatedDateTime) VALUE
        (in_name, in_price, in_country, in_label, in_imageUrl, in_createdDateTime);
    select last_insert_id() as ID;
end;

create or replace
    definer = root@localhost procedure BottleGetLastAdded(IN in_bottle_number int)
begin
    select *
    from bottles
    order by InputDateTime desc
    limit in_bottle_number;
end;

create or replace
    definer = root@localhost procedure BottlesGetByFilters(IN in_name varchar(256), IN in_price_min decimal,
                                                           IN in_price_max decimal, IN in_country char(2),
                                                           IN in_label varchar(512),
                                                           IN in_created_date_time_start datetime,
                                                           IN in_created_date_time_end datetime)
begin
    select *
    from bottles
    where lower(Name) like concat('%', lower(in_name), '%')
      and Price between in_price_min and in_price_max
      and lower(Country) like concat('%', lower(in_country), '%')
      and lower(Label) like concat('%', lower(in_label), '%')
      and CreatedDateTime between in_created_date_time_start and in_created_date_time_end;

end;

create or replace
    definer = root@localhost procedure CollectionAdd(IN in_name varchar(256), IN in_description varchar(1024),
                                                     IN in_account_id int)
begin
    if not exists(select 1 from accounts where ID = in_account_id)
    then
        signal sqlstate '45000' set message_text = 'Account ID does not exist';
    end if;
    insert into collections (name, description) VALUE (in_name, in_description);
    set @collectionID = last_insert_id();
    insert into account2collections (CollectionID, AccountID) VALUE (@collectionID, in_account_id);
    select * from collections where ID = @collectionID;
end;

create or replace
    definer = root@localhost procedure CollectionBottlesGetByFilters(IN in_account_ID int, IN in_collection_ID int,
                                                                     IN in_name varchar(256), IN in_price_min decimal,
                                                                     IN in_price_max decimal, IN in_country char(2),
                                                                     IN in_label varchar(512),
                                                                     IN in_created_date_time_start datetime,
                                                                     IN in_created_date_time_end datetime)
begin
    if not exists(select 1 from accounts where ID = in_account_id) then
        signal sqlstate '45000' set message_text = 'Account ID does not exist';
    end if;
    if not exists(select 1 from collections where ID = in_collection_id) then
        signal sqlstate '45000' set message_text = 'Collection ID does not exist';
    end if;
    if not exists(select 1
                  from account2collections
                  where AccountID = in_account_id
                    and CollectionID = in_collection_id) then
        signal sqlstate '45000' set message_text = 'Collection does not belong to account';
    end if;
    select B.*
    from bottles B
             join collection2bottles C2B on B.ID = C2B.BottleID
    where c2b.CollectionID = in_collection_ID
      and lower(B.Name) like concat('%', lower(in_name), '%')
      and B.Price between in_price_min and in_price_max
      and lower(B.Country) like concat('%', lower(in_country), '%')
      and lower(B.Label) like concat('%', lower(in_label), '%')
      and B.CreatedDateTime between in_created_date_time_start and in_created_date_time_end;

end;

create or replace
    definer = root@localhost procedure CollectionsAddBottle(IN in_account_id int, IN in_collection_id int, IN in_bottle_id int)
begin
    if not exists(select 1 from accounts where ID = in_account_id) then
        signal sqlstate '45000' set message_text = 'Account ID does not exist';
    end if;
    if not exists(select 1 from collections where ID = in_collection_id) then
        signal sqlstate '45000' set message_text = 'Collection ID does not exist';
    end if;
    if not exists(select 1 from bottles where ID = in_bottle_id) then
        signal sqlstate '45000' set message_text = 'Bottle ID does not exist';
    end if;
    if not exists(select 1
                  from account2collections
                  where AccountID = in_account_id and CollectionID = in_collection_id) then
        signal sqlstate '45000' set message_text = 'Collection does not belong to account';
    end if;
    insert into collection2bottles (CollectionID, BottleID) value (in_collection_id, in_bottle_id);
end;

create or replace
    definer = root@localhost procedure CollectionsGetByFilters(IN in_account_id int, IN in_name varchar(256),
                                                               IN in_description_pattern varchar(1024),
                                                               IN in_input_date_time_start datetime,
                                                               IN in_input_date_time_end datetime)
begin
    select C.*, ifnull(count(*), 0) as bottleNo
    from collections C
             join collection2bottles C2B on C.ID = C2B.CollectionID
             join account2collections A2C on C.ID = A2C.CollectionID
    where A2C.AccountID = in_account_id
      and lower(C.Name) like concat('%', lower(in_name), '%')
      and lower(C.Description) like concat('%', lower(in_description_pattern), '%')
      and C.InputDateTime between in_input_date_time_start and in_input_date_time_end
    group by C.ID;

end;

