
// var url = "https://api.melbournewater.com.au/rainfall-river-level/229143B/river-level/live.csv?fromDate=2022-05-12&toDate=2022-05-12";

// var request = new XMLHttpRequest();  
// request.open("GET", url, false);   
// request.send(null);  

// var csvData = new Array();
// var jsonObject = request.responseText.split(/\r?\n|\r/);
// for (var i = 0; i < jsonObject.length; i++) {

//   csvData.push(jsonObject[i].split(','));
// }
// // Retrived data from csv file content
// console.log(csvData);



const ctx = document.getElementById('chart');
const myChart = new Chart(ctx, {
    type: 'line',
    responsive: true,
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: 'YG',
            data: [12, 19, 3, 5, 2, 3],
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