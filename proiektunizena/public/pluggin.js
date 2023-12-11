//guardar en un JSON teclas pulsadas, click hacertados en los items del documento html, numero de clicks y coordenadas del click y el tiempo trascurrido desde el inicio de el guardado

let captureData = {
    clicks: [],
    keys: [],
    startTime: 0,
    endTime: 0,
  };
  
  function handleMouseClick(event) {
    const { clientX, clientY, target } = event;
    const closestElement = findClosestElement(clientX, clientY);
    captureData.clicks.push({
      x: clientX,
      y: clientY,
      element: target.tagName,
      closestElement: closestElement.tagName,
      timestamp: Date.now() - captureData.startTime,
    });
  }
  
  function handleKeyPress(event) {
    captureData.keys.push({
      key: event.key,
      timestamp: Date.now() - captureData.startTime,
    });
  }
  
  function findClosestElement(x, y) {
    return document.elementFromPoint(x, y);
  }
  
  function startCapture() {
    captureData.startTime = Date.now();
    window.addEventListener('click', handleMouseClick);
    window.addEventListener('keypress', handleKeyPress);
  }
  
  function stopCapture() {
    captureData.endTime = Date.now();
    window.removeEventListener('click', handleMouseClick);
    window.removeEventListener('keypress', handleKeyPress);
  
    // Muestra los datos capturados en la consola
    console.log(captureData);
  
    // Guarda los datos en un archivo JSON local y descarga
    saveAndDownloadCaptureData();
  }
  
  function saveAndDownloadCaptureData() {
    const jsonString = JSON.stringify(captureData, null, 2);
  
    // Crea un objeto Blob con el contenido JSON
    const blob = new Blob([jsonString], { type: 'application/json' });
  
    // Crea un objeto URL para el Blob
    const url = URL.createObjectURL(blob);
  
    // Crea un enlace <a> para descargar el archivo
    const a = document.createElement('a');
    a.href = url;
    a.download = 'captured_data.json';
  
    // Agrega el enlace al documento y simula un clic para descargar
    document.body.appendChild(a);
    a.click();
  
    // Elimina el enlace del documento
    document.body.removeChild(a);
  
    // Libera el objeto URL
    URL.revokeObjectURL(url);
  }
  
  browser.browserAction.onClicked.addListener((tab) => {
    // No es necesario manejar este evento en este ejemplo
  });
  