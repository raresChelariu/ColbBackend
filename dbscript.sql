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

create or replace
    definer = root@localhost procedure AccountLogin(IN clientEmail varchar(256), IN clientPassword varchar(256))
begin
    select Email, FirstName, LastName from accounts where Email = clientEmail and Password = clientPassword;
end;

create or replace
    definer = root@localhost procedure AccountRegister(IN email varchar(256), IN firstName varchar(256),
                                                       IN lastName varchar(256), IN password varchar(256))
begin
    insert into accounts (Email, FirstName, LastName, Password) VALUE (email, firstName, lastName, password);
end;

