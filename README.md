### Cum functioneaza? Si la ce ajuta.


Este o aplicatie simpla de unde descarcam audio dupa numar de telefon si data acestuia.

De multe ori avem nevoie de inregistrari audio care sunt in format mp3, sau alt format stocate intr-un folder care acesta trebuie sa fie definit in .env

## Metoda: POST
## Calea: http://api/syncron
Aceasta actualizeaza baza de date cu fisierele scanate de pe un director definit in .env


## Calea http://api/records
### Params ( optional ) 
```
{
    "limit": 10,
    "offset": 0,
    "search": "", // cauta doar petnru nume fisier
    "startTo": "", // cauta doar inregistrarile care incep cu data , inclusiv, format: YYYY-MM-DD HH:mm:ss
    "endTo": "", // cauta doar inregistrarile care se termina pana la data de, inclusiv, format: YYYY-MM-DD HH:mm:ss   
}
```
# Returneaza un json cu toate inregistrarile audio de la numarul de telefon si data specificata
Avem o lista care returneaza in format JSON cu toate proprietatrile despre aceste inregistrari.

## Calea http://api/records/[id]
Returneaza detalii despre aceea inregistrarile

## Calea http://api/records/[id]/download?stream=false
Returneaza fisierul audio in format mp3 ca descarcare



