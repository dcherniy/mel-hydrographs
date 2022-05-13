let config = {};
let gaugedata = {};
let charts = {};

// downloads the config json file with URLs to the gauges
(async function() {
    let res = await fetch('https://raw.githubusercontent.com/dcherniy/mel-hydrographs/master/urls.json')
    res = await res.json()
    config = res;
    configureEndpoints()
    await createCharts()
})();

Papa.parsePromise = function(file) {
    return new Promise(function(complete, error) {
      Papa.parse(file, {complete, error});
    });
  };

// helper function to create charts
let createCharts = async function() {
    for (const gaugeId in config) {
        await getGaugeData(gaugeId)
        createElement(gaugeId);
        createCtx(gaugeId);
    }
}

// helper function to configure the endpoints
// live will be used to get the live data (from today to today)
// hourly will be used to get the hourly data for the last 24 hours
// hourlydays will be used to get the hourly data for the last 7 days
const configureEndpoints = () => {

    let lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    // These will format to 'yyyy-mm-dd'
    let lastWeekString = lastWeek.toISOString().split('T')[0];
    let todayString = new Date().toISOString().split('T')[0];

    for (const key in config) {
        const x = config[key].hourly;
        config[key].live = config[key].live += `?fromDate=${todayString}&toDate=${todayString}`
        config[key].hourly = x + `?fromDate=${todayString}&toDate=${todayString}`
        config[key].hourlydays = x + `?fromDate=${lastWeekString}&toDate=${todayString}`
    }
}

const getGaugeData = (id) => new Promise((resolve, reject) => {
    
    Papa.parse(config[id].live, {
        download: true,
        complete: (results) =>{
            data = results.data.slice(1, results.data.length).map(r => [new Date(r[0]), parseFloat(r[2])]);
            gaugedata[id] = {live: data};
            resolve(data);
        },
        error: function(error) {
            reject(error);
        }
    });
})

const createElement = (id) => {
    var element = document.createElement("canvas");
    element.id = id;
    element.height = 10;
    element.width = 10;
    document.getElementById('main-container').appendChild(element);  
}

const createCtx = (id) => {
    console.log(gaugedata.YR)
    const ctx = document.getElementById(id);
    charts[id] = new Chart(ctx, {
        type: 'line',
        responsive: true,
        data: {
            labels: [],
            datasets: [{
                label: id,
                data: gaugedata[id].live,
                // backgroundColor: [
                //     'rgba(255, 99, 132, 0.2)',
                //     'rgba(54, 162, 235, 0.2)',
                //     'rgba(255, 206, 86, 0.2)',
                //     'rgba(75, 192, 192, 0.2)',
                //     'rgba(153, 102, 255, 0.2)',
                //     'rgba(255, 159, 64, 0.2)'
                // ],
                // borderColor: [
                //     'rgba(255, 99, 132, 1)',
                //     'rgba(54, 162, 235, 1)',
                //     'rgba(255, 206, 86, 1)',
                //     'rgba(75, 192, 192, 1)',
                //     'rgba(153, 102, 255, 1)',
                //     'rgba(255, 159, 64, 1)'
                // ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'timeseries'
                }
            }
        }
    });
}