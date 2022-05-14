let config = {};
let gaugedata = {};
let charts = {};

// downloads the config json file with URLs to the gauges
(async function() {
    document.title += ' ' + new Date().toLocaleDateString('en-US');
    let res = await fetch('https://raw.githubusercontent.com/dcherniy/mel-hydrographs/master/urls.json')
    res = await res.json();
    config = res;
    configureEndpoints();
    await createCharts();
})();




// helper function to create charts
let createCharts = async function() {
    for (const gaugeId in config) {
        gaugedata[gaugeId] = {};
        await getGaugeData(gaugeId, 'live')
        await getGaugeData(gaugeId, 'hourly')
        await getGaugeData(gaugeId, 'weekly')
        console.log(gaugedata)
        createElement(gaugeId);
        createCtx(gaugeId, 'live');
    }
}

// helper function to configure the endpoints
// live will be used to get the live data (from today to today)
// hourly will be used to get the hourly data for the last 24 hours
// weekly will be used to get the hourly data for the last 7 days
const configureEndpoints = () => {

    let lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    // These will format to 'yyyy-mm-dd'
    const lastWeekString = lastWeek.toISOString().split('T')[0];
    const todayString = new Date().toISOString().split('T')[0];

    for (const key in config) {
        const x = config[key].hourly;
        config[key].live = config[key].live += `?fromDate=${todayString}&toDate=${todayString}`
        config[key].hourly = x + `?fromDate=${todayString}&toDate=${todayString}`
        config[key].weekly = x + `?fromDate=${lastWeekString}&toDate=${todayString}`
    }
}

// gets gauge data and formats response for the chart
const getGaugeData = (id, key) => new Promise((resolve, reject) => {   
    Papa.parse(config[id][key], {
        download: true,
        complete: (results) =>{
            data = results.data.slice(1, results.data.length).map(r => 
                ({
                    x: r[0],
                    y: parseFloat(r[2])
                })
                );
            gaugedata[id][key] = data;
            resolve(data);
        },
        error: function(error) {
            reject(error);
        }
    });
})

// create canvas and container element for chart
const createElement = (id) => {
    const container = document.createElement('div');
    container.className = 'chart-container';
    const element = document.createElement('canvas');
    element.id = id;
    container.appendChild(element);
    createButtons(id, container);
    document.getElementById('main-container').appendChild(container);  
}

const createButtons = (id, container) => {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    const button = document.createElement('button');
    button.className = 'button';
    button.innerHTML = 'Live';
    button.onclick = () => {
        updateChart(id, 'live');
    }
    buttonContainer.appendChild(button);


    const button2 = document.createElement('button');
    button2.className = 'button';
    button2.innerHTML = 'Hourly (Today)';
    button2.onclick = () => {
        updateChart(id, 'hourly');
    }
    buttonContainer.appendChild(button2);

    const button3 = document.createElement('button');
    button3.className = 'button';
    button3.innerHTML = 'Hourly (Week)';
    button3.onclick = () => {
        updateChart(id, 'weekly');
    }
    buttonContainer.appendChild(button3);

    container.appendChild(buttonContainer);
}

const updateChart = (id, period) => {
    charts[id].data.datasets[0].data = gaugedata[id][period];
    charts[id].update();
}

// create context for chart
const createCtx = (id, key) => {
    const ctx = document.getElementById(id);
    charts[id] = new Chart(ctx, {
        type: 'line',
        responsive: false,
        maintainAspectRatio: false,
        data: {
            datasets: [{
                label: `${id}`, // label for the chart
                data: gaugedata[id][key],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    title: {text: 'm^3/s', display: true},
                },
                x: {
                    type: 'timeseries'
                }
            }
        }
    });
}