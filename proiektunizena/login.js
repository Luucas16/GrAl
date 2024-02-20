setInterval(function () {
    fetch("http://localhost:3000/getState", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Network response was not ok: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        izena = data.izena;
        state = data.state;
        if(izena !== ""){
          window.location.href = "popup.html";
      }
        
        console.log("State changed:", state.state);
      })
      .catch((error) => {
        console.error("Error during fetch:", error);
      });
   
  }, 50);



document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("submit").addEventListener("click", function () {
        var username = document.getElementById("user").value;
        fetch("http://localhost:3000/izena", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ izena: username }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Error en la solicitud: ${res.status}`);
                }
                return res.json();
            })
        window.location.href = "popup.html";
        
    });
}
);