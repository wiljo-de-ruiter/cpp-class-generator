# C++ Class Generator Extension

Deze VS Code extensie genereert automatisch een C++ class (header + source) in de huidige map, met:

- Copyright header inclusief jouw naam en bedrijfsnaam
- Header guards
- Constructor & destructor
- Veiligheid: bestanden worden niet overschreven

## Er worden ook een paar code snippets geïnstalleerd

- hdrguard om een header guard in te voegen
- cfunc om een static C-style functie te implementeren
- //-- om een functie splitter te maken
- mfunc om een class member functie te implementeren
- //## om een class of struct splitter te maken

## Gebruik

1. Vul in de VS Code-instellingen (`cppClassGenerator.authorName`) je naam in.
2. Vul in de VS Code-instellingen (`cppClassGenerator.companyName`) je bedrijfsnaam in.
3. Open een `.cpp` bestand of werk in een C++ project.
4. Gebruik de command palette (`Ctrl+Shift+P`) → “Create C++ Class”.
5. Of gebruik het context menu in de explorer -> "Create C++ Class".
6. Voer de klassenaam in → .h en .cpp bestanden worden gegenereerd.

