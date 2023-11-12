// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

// Pie Chart Example
function categoryInit(data) {
  console.log("data :", data);

  // const categories = data.categorySales.map((x) => (x.category))
  // const totalSales = data.categorySales.map((x) => (x.totalSales))
  // console.log("months :", categories);
  var ctx = document.getElementById("myPieChart");
  var myPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ["Fastfood", "Indian", "Beverage", "Others"],
      //labels: categories,

      datasets: [{
        data: [40, 30, 20, 10],
        //data: totalSales,

        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#B31C2A'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#96121f'],
        hoverBorderColor: "rgba(234, 236, 244, 1)",
      }],
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
      },
      legend: {
        display: true
      },
      cutoutPercentage: 80,
    },
  });

}

// const requestOptions = {
//   method: "GET",
//   headers: { "Content-Type": "application/json" },
// };



// fetch("/admin/getCategorySales", requestOptions)
//   .then((res) => res.json())
//   .then((data) => {
//     console.log("response Category sales", data)
//     categoryInit(data);
//   }).catch((error) => {
//     console.log("Category sales api error", error);
//   })
