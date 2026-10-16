# KNMI Assistent (demo)

Demopagina van een AI-zoekfunctie die werkt als agent, ingebouwd in de huisstijl van knmi.nl. Het is één statische pagina, zonder build-stap.

- Open `index.html` in de browser. Met `index.html?q=Zijn er nu waarschuwingen?` start de pagina meteen met die vraag.
- De inhoud komt van knmi.nl (stand van 16 oktober 2026): de weersverwachting, het nieuws, de aardbevingen en het logo.
- De antwoorden zijn vooraf geschreven. De functie `route()` in `index.html` kiest welk antwoord bij een vraag hoort. In productie neemt een LLM-agent met tools die taak over, zoals verwachtingen, waarschuwingen, seismologie, de API van het KNMI Data Platform en de sitezoeker.
