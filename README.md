Zerbitzaria martxan jartzeko: npm run start

Bezeroa: Hemen dago bezeroaren makinan egongo dena
  Public: Plugginaren karpeta 
    moment.js: Addon-ak hau erabiltzen du. Denboraren kudeketa egiteko balio du.
    pluggin.js: Addon-aren javascript fitxategia
  icon.png: (Hau opzionala da) Addon-aren ikonoa da
  manifest.json: Hemen dago addon-aren konfigurazio fitxategia. Hau da igo berha dena firefox-era

Zerbitzaria: Zerbitzariaren aldea
  test: Hemen jarriko dira experimentuan egin nahi diren atazaen konfigurazio fitxategiak (Dagoen formatua errespetatu behar da)
    conf.json: Hemen jarriko dira zenbat ataza egingo diren.
    testx.json Ataza baten konfigurazio fitxategia
  login.html: Behin add-ona kargatuta eta zeozer blatzerakoan add-onak, zerbitzaritik jasota nabigatzailean kargatuko duen html-a. Erabiltzaileak bere identifikatzailea sartu beharko du.
  popup.html: Identifikatzailea sartu eta gero kargatuko den html. (Experimentua hasteko botoia hemen dago)
  server.js: Zerbitzariak egingo duena.
  
  
