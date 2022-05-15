# ColbBackend
- Task: ColB (Collecting Bottles on Web)
Sa se dezvolte o aplicatie Web destinata colectionarilor de recipiente (sticle, clondire, butelii, damigene, butelci,...). Pe baza facilitatilor de cautare multi-criteriala implementate, utilizatorii autentificati vor putea crea, inventaria si partaja (sub)colectii de recipiente in functie de diverse caracteristici (tip, imagine, valoare, tara, perioada de utilizare, istoric, existenta etichetei etc.), plus vor putea importa/exporta datele referitoare la recipientele detinute. Se vor genera statistici diverse ce pot fi exportate in formate deschise – minimal, CSV si PDF. Se va realiza, de asemenea, un clasament al celor mai populare recipiente, disponibil si ca flux de date RSS.

- install MariaDB 
( for user root, set password the same as DB_PASSWORD (value found in .env file))
( for MariaDB port, set port to 3306 (value found in .env file))
- in Command Prompt, go to folder where you downloaded this repository and run "node main"  to start it
(
on success, a similar text should appear:

get /bottles
get /bottles/authroute
get /bottles/testing
post /accounts/register
post /accounts/login

Server is now listening for requests on port 3000

)
- after this, open main.html page in browser
