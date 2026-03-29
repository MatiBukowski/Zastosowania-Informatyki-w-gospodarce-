# Zastosowania-Informatyki-w-gospodarce

Projekt z przedmiotu: Zastosowania Informatyki w gospodarce polegający na usprawnieniu pracy restauracji poprzez ułatwienie procesu rezerwacji stolika, czy też zamawiania jedzenia poprzez skan kodu QR na stoliku, albo zamawianie wraz z rezerwacją. Projekt uwzględnia również zbiór oraz analizę danych, która ułatwi restauracji prowadzenie biznesu, na przykład atrakcyjność dnia, czy też stolika, a także popularność danej pozycji z MENU.

---

## Skład projektowy

- Jakub Brzozowski - kierownik projektu, full stack developer.
- Mateusz Bukowski - backend developer.
- Maciek Kusz - backend developer.
- Weronika Gut - frontend developer.
- Kamil Fiącek - frontend developer.
- Dawid Jabłoński - deploy (VPS) z gh actions i dockerem, baza danych, CI/CD.

## Bardziej szczegółowy opis

### Różne sposoby zamawiania:

- Zamawianie przez kiosk
- Zamawianie przez telefon, wraz z na przykład rezerwacją stolika i przygotowaniem jedzenia, aby klient mógł przyjść na gotowe
- Zamawianie przy stole przez kod QR

### Wszelkiego rodzaju analiza danych:

- Zależność dni specjalnych (walentynki) od liczby klientów, liczby zamówień
- Predykcja liczby danych zamówień w danym dniu na podstawie danych przeszłych
- Zbieranie danych o liczbie zamówień na konkretny dzień, liczbę klientów w danej godzinie

### Tiktok jako marketing restauracji (ewentualnie specjalnie do reklamy jakiś ofert specjalnych) (TO BE SPECIFIED)

---

## Documentation

- [Architecture](Documentation/ARCHITECTURE.md)
- [Endpoints](Documentation/ENDPOINTS.md)
- [Development Guide (Migrations, Tests, OpenAPI)](Documentation/DEVELOPMENT.md)
