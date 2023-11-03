// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

function number_format(number, decimals, dec_point, thousands_sep) {
  // *     example: number_format(1234.56, 2, ',', ' ');
  // *     return: '1 234,56'
  number = (number + '').replace(',', '').replace(' ', '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.round(n * k) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}
function areaChartData(data) {
  console.log(data)
}
// Area Chart Example
var ctx = document.getElementById("myAreaChart");
var myLineChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{
      label: "Revenue",
      lineTension: 0.3,
      backgroundColor: "#ffeff0",
      borderColor: "#B31C2A",
      pointRadius: 3,
      pointBackgroundColor: "#B31C2A",
      pointBorderColor: "#B31C2A",
      pointHoverRadius: 3,
      pointHoverBackgroundColor: "#B31C2A",
      pointHoverBorderColor: "#B31C2A",
      pointHitRadius: 10,
      pointBorderWidth: 2,
      data: [
        revenueByMonth.jan,
        revenueByMonth.feb != 0 ? revenueByMonth.feb : null,
        revenueByMonth.mar != 0 ? revenueByMonth.mar : null,
        revenueByMonth.apr != 0 ? revenueByMonth.apr : null,
        revenueByMonth.may != 0 ? revenueByMonth.may : null,
        revenueByMonth.jun != 0 ? revenueByMonth.jun : null,
        revenueByMonth.jul != 0 ? revenueByMonth.jul : null,
        revenueByMonth.aug != 0 ? revenueByMonth.aug : null,
        revenueByMonth.sep != 0 ? revenueByMonth.sep : null,
        revenueByMonth.oct != 0 ? revenueByMonth.oct : null,
        revenueByMonth.nov != 0 ? revenueByMonth.nov : null,
        revenueByMonth.dec != 0 ? revenueByMonth.dec : null
      ]

    }],
  },
  options: {
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 25,
        top: 25,
        bottom: 0
      }
    },
    scales: {
      xAxes: [{
        time: {
          unit: 'date'
        },
        gridLines: {
          display: true,
          drawBorder: true
        },
        ticks: {
          maxTicksLimit: 7
        }
      }],
      yAxes: [{
        ticks: {
          maxTicksLimit: 9,
          padding: 10,
          // Include a dollar sign in the ticks
          callback: function (value, index, values) {
            return '₹' + number_format(value);
          }
        },
        gridLines: {
          color: "rgb(234, 236, 244)",
          zeroLineColor: "rgb(234, 236, 244)",
          drawBorder: false,
          borderDash: [2],
          zeroLineBorderDash: [2]
        }
      }],
    },
    legend: {
      display: false
    },
    tooltips: {
      backgroundColor: "rgb(255,255,255)",
      bodyFontColor: "#858796",
      titleMarginBottom: 10,
      titleFontColor: '#6e707e',
      titleFontSize: 14,
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      intersect: false,
      mode: 'index',
      caretPadding: 10,
      callbacks: {
        label: function (tooltipItem, chart) {
          var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
          return datasetLabel + ': ₹' + number_format(tooltipItem.yLabel);
        }
      }
    }
  }
});
