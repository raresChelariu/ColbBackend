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
    ID           int null,
    CollectionID int not null,
    BottleID     int not null,
    primary key (CollectionID, BottleID),
    constraint Collection2Bottles_FK_BottleID
        foreign key (BottleID) references bottles (ID)
            on update cascade on delete cascade,
    constraint Collection2Bottles_FK_CollectionID
        foreign key (CollectionID) references collections (ID)
            on update cascade on delete cascade
);

create or replace table logs
(
    message       varchar(5000)                        null,
    inputdatetime datetime default current_timestamp() null
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
    definer = root@localhost procedure BottleTest(OUT out_row_count int)
begin
    select count(*) into out_row_count from bottles where 1 = 1;
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
    insert into collections (name, description) VALUE (in_name, in_description);
    if not exists(select 1 from accounts where ID = in_account_id)
    then
        delete from collections where ID = last_insert_id();
    end if;
    insert into account2collections (CollectionID, AccountID) VALUE (last_insert_id(), in_account_id);
end;

create or replace
    definer = root@localhost procedure CollectionsGetByFilters(IN in_account_id int, IN in_name decimal,
                                                               IN in_description_pattern decimal,
                                                               IN in_input_date_time_start datetime,
                                                               IN in_input_date_time_end datetime)
begin
    select C.*, count(*) as bottleNo
    from collections C
             join collection2bottles C2B on C.ID = C2B.CollectionID
    where C.ID = in_account_id
      and C.Name like concat('%', in_name, '%')
      and C.Description like concat('%', in_description_pattern, '%')
      and C.InputDateTime between in_input_date_time_start and in_input_date_time_end
    group by C.ID;

end;

