# C++ Class Generator Extension

Deze extensie genereert automatisch een C++ class (header + source) in de correcte map, met:

- Copyright file header inclusief jouw naam en bedrijfsnaam
- Header guards
- Constructor & destructor
- Veiligheid: bestanden worden niet overschreven

## Gebruik

1. Ga naar de VS Code-instellingen (`Ctrl+,`)
1.1. Zoek in de "Extensions" naar "C++ Class Generator"
1.2. Vul je naam in bij "Author Name".
1.3. Vul je bedrijfsnaam in bij "Company Name".
2. Open een `.cpp` bestand of werk in een C++ project.
3. Gebruik de command palette (`Ctrl+Shift+P`) → “C++: Create files for new C++ Class”.
4. Of selecteer de editor context menu "Create files for new C++ Class"
5. Of selecteer de file explorer context menu "Create files for new C++ Class"
6. Voer de class naam in en de ClassName.h en ClassName.cpp bestanden worden gegenereerd.
7. Als de actieve map op inc, include, src of source eindigt, dan worden de files op de juiste plek gemaakt.

## Er worden ook editor context items toegevoegd
- Om een copyright file header te maken
- Om een class declaratie toe te voegen aan de huidige actieve header file
- Om een class declaratie en/of definitie toe te voegen aan de huidige actieve source file
- Om een class header/footer te maken van de geselecteerde class naam

## Er worden ook een paar code snippets geïnstalleerd

- hdrguard om een header guard in te voegen
- cfunc om een static C-style functie te implementeren
- //-- om een functie splitter te maken
- mfunc om een class member functie te implementeren
- //## om een class of struct splitter te maken
