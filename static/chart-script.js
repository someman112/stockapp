const socket = new WebSocket('ws://localhost:8765');
const ctx = document.getElementById('liveChart').getContext('2d');
let chart = null;
let marketOpen;
let holiday;
let postmkt;
const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgb(152,229,229)');
gradient.addColorStop(1, 'rgb(0,0,0)');
let lastprice = null;


function createOrUpdateChart() {
  if (chart) {
    chart.destroy(); // Clear the existing chart
  }

chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Price',
      data: [],
      backgroundColor: gradient,
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 4,
      fill: true
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          color: "white",
          font: {
            family: 'Lato',
            size: 15,
            weight: 'bold'
          }
        }
      },
      y: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          color: "white",
          font: {
            family: 'Lato',
            size: 15,
            weight: 'Bold'
          }
        }
      }
    },
    elements: {
      line: {
        borderWidth: 2,
        tension: 0.4
      },
      point: {
        radius: 0,
        hoverRadius: 4
      }
    },
    interaction: {
      mode: 'nearest',
      intersect: false
    },
    plugins: {
      tooltip: {
        enabled: true
      },
    }
  }
});

}

// Send a query to WebSocket
function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value;

  if(message!== ''){
    socket.send(message);
    messageInput.value = ''; // Clear the input field
    createOrUpdateChart();
  }

}

document.addEventListener("DOMContentLoaded", function() {
  const priceval = document.getElementById("data-value");
  const symbolval = document.getElementById("symbol-value");
  const sym_change = document.getElementById("sym-chng");
  const sym_change_pt = document.getElementById("sym-chng-pt");
  let animation;

  socket.onmessage = function(event) {
      const data_str = event.data;
      const info = JSON.parse(data_str);
      console.log(info)
    if (info[0]=== "Market closed") {
      marketOpen = false;
      postmkt = false;
      priceval.textContent = "";
      symbolval.textContent = "";
      sym_change.textContent = "";
      sym_change_pt.textContent = "";
    } else if (info[0] === "Holiday") {
      postmkt = false;
      marketOpen = false;
      holiday = true;
    }
    else {
      if(info[info.length - 1] === "Post-market"){
        postmkt = true;
        marketOpen = false;
      }
      else{
        marketOpen = true;
      }
      const img = document.getElementById('symbol-img');
      img.src = info[4];
      const data = parseFloat(info[1]);
      const time = new Date().toLocaleTimeString();
      chart.data.labels.push(time);
      chart.data.datasets[0].data.push(data);
      chart.update();

      symbolval.textContent = info[0] + ": ";
      priceval.textContent = info[1];
      sym_change.textContent = info[2] + " ";
      sym_change_pt.textContent = info[3];

      if(sym_change.textContent[0] === "+"){
        sym_change.style.color = "#2fff40"
      }
      else{
        sym_change.style.color = "#fc3c3c";
      }

      if(sym_change_pt.textContent[0] === "+"){
        sym_change_pt.style.color = "#2fff40"
      }
      else{
        sym_change_pt.style.color = "#fc3c3c";
      }

      priceval.classList.remove("blink-green", "blink-red");

      if (!lastprice || lastprice === data) {
        priceval.style.color = "white";
      } else if (data > lastprice) {
        priceval.classList.add("blink-green");
        animation = "blink-green";
      } else {
        priceval.classList.add("blink-red");
        animation = "blink-red";
      }

      if (animation){
        setTimeout(() => {
          priceval.classList.remove(animation)
        }, 1000);
      }


      lastprice = data;
    }

    toggleMarketStatus();
  };
});

function search() {
  sendMessage()
}

function toggleMarketStatus() {
  const ringContainer = document.querySelector('.ring-container');
  const dot = document.querySelector('.circle');
  const pulsor = document.querySelector('.ringring');

  if (marketOpen) {
    console.log("open");
    if(!ringContainer.contains(pulsor)){
      const pulsor = document.createElement('div');
      pulsor.classList.add('ringring');
      ringContainer.appendChild(pulsor);
      pulsor.style.borderColor = "#62bd19";
      dot.style.backgroundColor = '#62bd19';
      dot.setAttribute('title', "Market open");
    }
    pulsor.style.borderColor = "#62bd19";
    dot.style.backgroundColor = '#62bd19';
    dot.setAttribute('title', "Market open");
  }
  else if(holiday){
    ringContainer.removeChild(pulsor);
    dot.style.backgroundColor = '#13b2ff';
    dot.setAttribute('title', "Market's on holiday");
  }
  else if(postmkt){
    console.log("postmkt");
    if(!ringContainer.contains(pulsor)){
      const pulsor = document.createElement('div');
      ringContainer.appendChild(pulsor);
      pulsor.classList.add('ringring');
      pulsor.style.borderColor = "#ff6f00";
      dot.style.backgroundColor = '#ff6f00';
      dot.setAttribute('title', "Post-market Trading");
    }
      pulsor.style.borderColor = "#ff6f00";
      dot.style.backgroundColor = '#ff6f00';
      dot.setAttribute('title', "Post-market Trading");
  }

  else if (!marketOpen){
    console.log("closed");
    ringContainer.removeChild(pulsor);
    dot.style.backgroundColor = '#ff2727';
    dot.setAttribute('title', "Market closed");
  }
}

createOrUpdateChart(); // Create the initial chart
