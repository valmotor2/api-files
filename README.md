### Cum functioneaza? Si la ce ajuta.

Este o aplicatie simpla de unde descarcam fisiere dupa numele fisierului, data fisierului creat, etc.

De multe ori avem nevoie de anumite fisierecare sunt in format-ul x stocate intr-un folder care acesta trebuie sa fie
definit in .env

## Atentie,

### Inainte de rularea aplicatiei:

- versiunea minima de node: v16.20.1
- completati fisierul .env cu datele necesare
- aveti nevoie sa generati sqlite pentru stocarea informatiilor despre fisier, rulati comanda:

```
npx drizzle-kit generate:sqlite --schema=db.ts
```

## GET: http://api/syncron

Aceasta actualizeaza baza de date cu fisierele scanate de pe un director definit in .env

## GET http://api/records

### QUERY ( optional )

```
{
    "limit": 10,
    "offset": 0,
    "search": "", // cauta doar petnru nume fisier
    "startTo": "", // cauta doar fisierele care incep cu data , inclusiv, format: YYYY-MM-DD HH:mm:ss
    "endTo": "", // cauta doar fisierele care se termina pana la data de, inclusiv, format: YYYY-MM-DD HH:mm:ss
}
```

# Returneaza in format JSON

Avem o lista care returneaza in format JSON cu toate proprietatrile despre aceste inregistrari.

## GET http://api/records/[id]

Returneaza detalii despre fisier

## GET http://api/records/[id]/download

Arunca in format binar fisierul cerut

## DELETE http://api/records/[id]

Sterge mai intai fisierul, daca reuseste, sterge apoi inregistrarea, in caz contrar arunca eroare 500
