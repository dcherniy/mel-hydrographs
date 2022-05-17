let config = {};
let gaugedata = {};
let charts = {};

// downloads the config json file with URLs to the gauges
(async function() {
    let res = await fetch('https://raw.githubusercontent.com/dcherniy/mel-hydrographs/master/urls.json')
    res = await res.json();
    config = res;
    configureEndpoints();
    await createCharts();
})();


// helper function to create charts
let createCharts = async function() {

    for (const gaugeId in config) {
        createContainer(gaugeId)
    }

    for (const gaugeId in config) {
        gaugedata[gaugeId] = {};
        await getGaugeData(gaugeId, 'live')
        await getGaugeData(gaugeId, 'hourly')
        await getGaugeData(gaugeId, 'weekly')
        await getGaugeData(gaugeId, 'live_river')
        await getGaugeData(gaugeId, 'hourly_river')
        await getGaugeData(gaugeId, 'weekly_river')
        createChartElement(gaugeId);
        createCtx(gaugeId, 'live_river');
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
        const y = config[key].hourly_river
        config[key].live = config[key].live += `?fromDate=${todayString}&toDate=${todayString}`
        config[key].hourly = x + `?fromDate=${todayString}&toDate=${todayString}`
        config[key].weekly = x + `?fromDate=${lastWeekString}&toDate=${todayString}`
        config[key].live_river = config[key].live_river += `?fromDate=${todayString}&toDate=${todayString}`
        config[key].hourly_river = y + `?fromDate=${todayString}&toDate=${todayString}`
        config[key].weekly_river = y + `?fromDate=${lastWeekString}&toDate=${todayString}`

    }
}

// gets gauge data and formats response for the chart
const getGaugeData = (id, key) => new Promise((resolve, reject) => {  
    const river_flow = key.includes('_');
    Papa.parse(config[id][key], {
        download: true,
        complete: (results) =>{
            data = results.data.slice(1, results.data.length).map(r => 
                ({
                    x: r[0],
                    y: (river_flow ? parseFloat(r[1]) : parseFloat(r[2]))
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

// create container 
const createContainer = (id) => {
    const container = document.createElement('div');
    container.className = 'chart-container'
    container.id = 'chart-container' + '-' + id;
    document.getElementById('main-container').appendChild(container);  
    createLoader(id);
}

const createLoader = (id) => {
    const container = document.getElementById('chart-container' + '-' + id);
    const loader = document.createElement('div');
    loader.className = 'loader';
    container.appendChild(loader);
}

// create canvas and container element for chart
const createChartElement = (id) => {
    const container = document.getElementById('chart-container' + '-' + id);

    container.getElementsByClassName('loader')[0].remove();

    const element = document.createElement('canvas');
    element.id = id;
    container.appendChild(element);
    createButtons(id, container);
}

const createButtons = (id, container) => {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.id = 'button-container' + '-' + id;

    const button = document.createElement('button');
    button.className = 'period btn active';
    button.id = `${id}-live-btn`;
    button.innerHTML = 'Live';
    button.onclick = () => {
        updateChart(id, 'live');
    }
    buttonContainer.appendChild(button);


    const button2 = document.createElement('button');
    button2.className = 'period btn';
    button2.id = `${id}-hourly-btn`;
    button2.innerHTML = 'Hourly (Today)';
    button2.onclick = () => {
        updateChart(id, 'hourly');
    }
    buttonContainer.appendChild(button2);

    const button3 = document.createElement('button');
    button3.className = 'period btn';
    button3.id = `${id}-weekly-btn`;
    button3.innerHTML = 'Hourly (Week)';
    button3.onclick = () => {
        updateChart(id, 'weekly');
    }
    buttonContainer.appendChild(button3);

    const button4 = document.createElement('button');
    button4.className = 'btn mass';
    button4.id = `${id}-flow-btn`;
    button4.innerHTML = 'Flow';
    button4.onclick = () => {
        updateMass(id, 'flow');
    }
    buttonContainer.appendChild(button4);

    const button5 = document.createElement('button');
    button5.className = 'btn mass active';
    button5.id = `${id}-river-btn`;
    button5.innerHTML = 'Level';
    button5.onclick = () => {
        updateMass(id, 'river');
    }
    buttonContainer.appendChild(button5);

    container.appendChild(buttonContainer);
}

const updateChart = (id, period) => {
    removePeriodClasses(id);
    document.getElementById(`${id}-${period}-btn`).className = 'period btn active';

    const river = charts[id].activeriver;
    const activekey = river ? period + '_river' : period;

    charts[id].data.datasets[0].data = gaugedata[id][activekey];
    charts[id].update();
    charts[id].activekey = activekey;
}

const updateMass = (id, mass) => {
    removeMassClasses(id);
    document.getElementById(`${id}-${mass}-btn`).className = 'mass btn active';

    let key = charts[id].activekey;
    let activekey = key.split('_')[0];
    if (mass === 'river') activekey += '_river';
    charts[id].activekey = activekey;
    charts[id].data.datasets[0].data = gaugedata[id][activekey];
    charts[id].options.scales.y.title.text = mass === 'flow' ? 'm³/s' : 'Level (m)';
    charts[id].update();
}

const removeMassClasses = (id) => {
    const container = document.getElementById('button-container' + '-' + id);
    const buttons = container.getElementsByClassName('mass');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].className = 'mass btn';
    }
}

const removePeriodClasses = (id) => {
    const container = document.getElementById('button-container' + '-' + id);
    const buttons = container.getElementsByClassName('period');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].className = 'period btn';
    }
}

// create context for chart
const createCtx = (id, key) => {
    const ctx = document.getElementById(id);
    const river = key.includes('_');
    charts[id] = new Chart(ctx, {
        type: 'line',
        responsive: false,
        maintainAspectRatio: false,
        data: {
            datasets: [{
                data: gaugedata[id][key],
            }]
        },
        options: {
            elements: {
                line: {
                    borderWidth: 2,
                    borderColor: '#0047AB'
                },
                point: {
                    borderColor: '#0047AB',
                    radius: 0
                }
            },
            plugins: {
                legend: {
                    display: false
                  },
                title: {
                    display: true,
                    text: `${id}`
                }
            },
            scales: {
                y: {
                    title: {text: 'Level (m)', display: true},
                },
                x: {
                    type: 'timeseries'
                }
            }
        }
    });
    charts[id]['activeriver'] = river;
    charts[id]['activekey'] = key;
}