$(document).ready(function () {
  setInterval(() => {
    time();
  }, 1000);

  let time = () => {
    let t = new Date();
    let hh = t.getHours() < 10 ? "0" + t.getHours() : t.getHours();
    let mm = t.getMinutes() < 10 ? "0" + t.getMinutes() : t.getMinutes();
    let ss = t.getSeconds() < 10 ? "0" + t.getSeconds() : t.getSeconds();
    $("#time").text(hh + ":" + mm + ":" + ss);
  };
  var table = $("#table_1").DataTable({
    language: {
      zeroRecords: "Записей нет",
    },
    scrollY: "250px",
    scrollX: true,
    scrollCollapse: true,
    paging: false,
    info: false,
    sDom: "lrtip", //откл поиск
    autoWidth: false,
    columns: [{ width: "10%" }, { width: "50%" }, null, { width: "100%" }],
  });

  var ctx = document.getElementById("myChart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Вечерняя Уфа",
          borderColor: "Blue",
          fill: false,
        },
        {
          label: "PlayBoy",
          borderColor: "Red",
          fill: false,
        },
        {
          label: "The Times",
          borderColor: "Green",
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              unit: "second",
              displayFormats: {
                second: "HH:mm:ss",
              },
            },
            scaleLabel: {
              display: true,
              labelString: "Время",
            },
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Продано",
            },
          },
        ],
      },
    },
  });

  var table2 = $("#table_2").DataTable({
    language: {
      zeroRecords: "Записей нет",
    },
    scrollY: "200px",
    scrollX: true,
    scrollCollapse: true,
    paging: false,
    info: false,
    sDom: "lrtip", //откл поиск
    autoWidth: false,
    columns: [{ width: "45px" }, { width: "360px" }, { width: "202px" }],
  });

  var start = false;
  var stock = [20, 20, 20];
  var sold = [0, 0, 0];
  var stockLeft = stock[0] + stock[1] + stock[2];
  var price = [140, 250, 200];
  var money = 0;
  var storage = 2700;
  var moneyMax = 3000;
  var moneyLeft = moneyMax - storage;
  var timer, timer2;
  var crash = [false, false];
  var index = 0,
    indexOfCrash = 0;
  var cycle = true;
  var autoFix = false;

  let sell = (paper) => {
    let paperName;
    switch (paper) {
      case 0:
        paperName = "Вечерняя Уфа";
        break;
      case 1:
        paperName = "PlayBoy";
        break;
      case 2:
        paperName = "The Times";
        break;
    }
    if (table.row(":last", { order: "index" }).data() != undefined) {
      index = table.row(":last", { order: "index" }).data()[0] + 1;
    }
    let date = new Date();
    let hh = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    let mm =
      date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let ss =
      date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    table.row
      .add([index, paperName, price[paper], hh + ":" + mm + ":" + ss])
      .draw(true);
  };

  let log = (crashName) => {
    if (table2.row(":last", { order: "index" }).data() != undefined) {
      indexOfCrash = table2.row(":last", { order: "index" }).data()[0] + 1;
    }
    let date = new Date();
    let hh = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    let mm =
      date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let ss =
      date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    table2.row
      .add([indexOfCrash, crashName, hh + ":" + mm + ":" + ss])
      .draw(true);
  };

  let updateStockLeft = () => {
    stockLeft = stock[0] + stock[1] + stock[2];
  };

  let updateMoneyLeft = () => {
    moneyLeft = moneyMax - storage;
  };

  let updateStat = () => {
    $("#sold").text(index + 1);
    $("#money").text(money);
    $("#paper").text(stockLeft);
    $("#storage").text(moneyLeft);
  };

  let chart = (paper) => {
    myChart.data.datasets[paper].data.push({ x: new Date(), y: sold[paper]++ });
    myChart.update();
  };

  let autoFixPaper = () => {
    stock = [20, 20, 20];
    updateStockLeft();
    $("#paper").text(stockLeft);
  };

  let autoFixMoney = () => {
    storage = 0;
    updateMoneyLeft();
    $("#storage").text(moneyLeft);
  };

  let checkCrash = () => {
    if (stockLeft == 0) {
      if (autoFix) {
        autoFixPaper();
        log("Закончились газеты");
      } else {
        if (!crash[0]) log("Закончились газеты");
        crash[0] = true;
        $("#fix_paper").attr("disabled", false);
        $("#crash_paper").attr("disabled", true);
        $("#stop").attr("disabled", true);
        $("#paper").text("нет").addClass("text-danger");
        if ($("#job").text() == "работает") {
          $("#job")
            .text("авария")
            .removeClass("text-success")
            .addClass("text-danger");
        }
      }
    }

    if (moneyLeft == 0) {
      if (autoFix) {
        autoFixMoney();
        log("Касеты переполнены");
      } else {
        moneyCrash();
      }
    } else if (
      (moneyLeft - price[0] && moneyLeft - price[1] && moneyLeft - price[2]) <=
      0
    ) {
      if (autoFix) {
        autoFixMoney();
        log("Касеты переполнены");
      } else {
        moneyCrash();
      }
    }
  };

  let moneyCrash = () => {
    if (!crash[1]) log("Касеты переполнены");
    crash[1] = true;
    $("#fix_storage").attr("disabled", false);
    $("#crash_storage").attr("disabled", true);
    $("#stop").attr("disabled", true);
    $("#storage").text("нет").addClass("text-danger");
    if ($("#job").text() == "работает") {
      $("#job")
        .text("авария")
        .removeClass("text-success")
        .addClass("text-danger");
    }
  };

  let work = () => {
    start = true;
    autoFix = $("#autoFix").is(":checked");
    $("#start").attr("disabled", true);
    $("#stop").attr("disabled", false);
    $("#settings").attr("disabled", true);
    $("#crash_paper").attr("disabled", false);
    $("#crash_storage").attr("disabled", false);
    $("#job")
      .text("работает")
      .addClass("text-success")
      .removeClass("text-danger");
    $("#paper").text(stock[0] + stock[1] + stock[2]);
    $("#storage").text(moneyLeft);

    timer = setInterval(() => {
      checkCrash();
      if (!crash.includes(true) && cycle) {
        cycle = false;
        let rnd = Math.floor(Math.random() * (10000 - 3000) + 3000);
        timer2 = setTimeout(() => {
          innerCycle();
        }, rnd);
      }
    }, 500);
  };

  let innerCycle = () => {
    let paper = Math.floor(Math.random() * (3 - 0) + 0);
    if (!crash.includes(true) && start) {
      sell(paper);
      chart(paper);
      money += price[paper];
      storage += price[paper];
      updateMoneyLeft();
      stock[paper] = stock[paper] - 1;
      updateStockLeft();
      updateStat();
      cycle = true;
    }
  };

  let updateStatusIfNotCrash = () => {
    if (!crash.includes(true)) {
      $("#stop").attr("disabled", false);
      $("#job")
        .text("работает")
        .addClass("text-success")
        .removeClass("text-danger");
    }
  };

  let fix_paper = () => {
    crash[0] = false;
    cycle = true;
    stock = [20, 20, 20];
    updateStockLeft();
    $("#fix_paper").attr("disabled", true);
    $("#paper").text(stockLeft).removeClass("text-danger");
    $("#crash_paper").attr("disabled", false);
    updateStatusIfNotCrash();
  };

  let fix_storage = () => {
    crash[1] = false;
    cycle = true;
    storage = 0;
    updateMoneyLeft();
    $("#fix_storage").attr("disabled", true);
    $("#storage").text(moneyLeft).removeClass("text-danger");
    $("#crash_storage").attr("disabled", false);
    updateStatusIfNotCrash();
  };

  let crash_paper = () => {
    stock = [0, 0, 0];
    clearTimeout(timer2);
    updateStockLeft();
  };

  let crash_storage = () => {
    storage = moneyMax;
    clearTimeout(timer2);
    updateMoneyLeft();
  };

  $("#start").click(() => {
    work();
  });

  $("#stop").click(() => {
    clearTimeout(timer2);
    clearInterval(timer);
    cycle = true;
    start = false;
    $("#start").attr("disabled", false);
    $("#stop").attr("disabled", true);
    $("#settings").attr("disabled", false);
    $("#crash_paper").attr("disabled", true);
    $("#crash_storage").attr("disabled", true);
  });

  $("#fix_paper").click(() => {
    fix_paper();
  });

  $("#fix_storage").click(() => {
    fix_storage();
  });

  $("#crash_paper").click(() => {
    if (autoFix) {
      alert("Отключите автоматическое устранение аварий!");
      return false;
    }
    $("#crash_paper").attr("disabled", true);
    crash_paper();
  });

  $("#crash_storage").click(() => {
    if (autoFix) {
      alert("Отключите автоматическое устранение аварий!");
      return false;
    }
    $("#crash_storage").attr("disabled", true);
    crash_storage();
  });

  $("#settings").click(() => {
    $("#settings_modal").modal("show");
  });

  $("#settings_modal_close").click(() => {
    $("#settings_modal").modal("hide");
  });
});
