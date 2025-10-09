# C++ Class Generator Extension

Deze VS Code extensie genereert automatisch een C++ class (header + source) in de huidige map, met:

- Copyright header inclusief jouw naam
- Header guards
- Constructor & destructor
- Veiligheid: bestanden worden niet overschreven

## Gebruik

1. Vul in de VS Code-instellingen (`cppClassGenerator.authorName`) je naam in.
2. Vul in de VS Code-instellingen (`cppClassGenerator.companyName`) je bedrijfsnaam in.
3. Open een `.cpp` bestand of werk in een C++ project.
4. Gebruik de command palette (`Ctrl+Shift+P`) → “Create C++ Class”.
5. Voer de klassenaam in → .h en .cpp bestanden worden gegenereerd.

