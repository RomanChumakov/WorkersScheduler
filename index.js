    //Константы///////////////////////////////////////////////////////////////////////////////
var weekDays = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"],
    vacationFine = 9, //штраф за работу в день, в который работник не должен работать (отпуск, болезнь, сильная переработка и т.д.)
    morningAfterEveningFine = 2, //штраф за работу после ночной смены
    throwOneFine = 2, //штраф за работу через смену
    overtimeFine = 1.5, //штраф за переработку по количеству смен
    dayPriority = 0.3, //приоритет после работы утром доработать сутки

    //Задаваемые пользователем в полях////////////////////////////////////////////////////////
    firstWeekDay,  //день недели первого в месяце дня
    workersAmount, //количество работников 
    dayAmount,   //дней в месяце
    
    //Задаваемые пользователем в таблице////////////////////////////////////////////////////////
    workers = [], // массив работников (каждый элемент есть массив смен за месяц (отпуска указаны))
    shiftsByDay = [], // массив количества смен по дням
    shiftAmount = [], // массив количества смен по работникам
    preferences = [], // предпочтительность выбора сотрудников
    shifts = [],      // "отработанные" смены
    dayOffAmount = [],// количество выходных
    shiftRelation = 0,// отношение прошедших смен ко всем сменам месяца

    i, j; // итераторы

$("#prepare-submit").on("click", function() {
    while (!(+($("#workers-quantity").val())>0)) {
        alert("Неверный формат количества работников! Требуется натуральное число!");
        return;
    }
    workersAmount = +$("#workers-quantity").val();
    
    while (!(+($("#day-quantity").val())>=28 && +($("#day-quantity").val())<=31)) {
        alert("Неверный формат дней в месяце! Требуется от 28 до 31!");
        return;
    }
    dayAmount = +$("#day-quantity").val();
    
    while (!_.contains(weekDays ,$("#weekday").val())) {
        alert("Неверный формат дней недели! Допустимые значения: пн, вт, ср, чт, пт, сб, вс!");
        return;
    }
    firstWeekDay = _.indexOf(weekDays ,$("#weekday").val());
    
    var table = document.getElementById("prepare-table");
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    
    //вывод таблицы//////////////////////////////////////////////////////////////////////////////////////////// 
    var tr = document.createElement("tr");
    tr.id = "prepare-mounth-day";
    document.getElementById("prepare-table").appendChild(tr);

    var td = document.createElement("td");
    td.appendChild(document.createTextNode("День месяца: "));
    document.getElementById("prepare-mounth-day").appendChild(td);

    for (j=1; j<= 3*dayAmount; j++) {
        var td = document.createElement("td");
        if (!(j % 3)) 
            td.appendChild(document.createElement("pre").appendChild(document.createTextNode(((j - j%3)/3) + "\n" + weekDays[((firstWeekDay + (j - j%3)/3 - 1)%7)])));
        else {
            td.appendChild(document.createTextNode(""));
            td.className = "day";
        }
        td.width = 10;
        document.getElementById("prepare-mounth-day").appendChild(td);
    }
    
    var tr = document.createElement("tr");
    tr.id = "prepare-shifts";
    document.getElementById("prepare-table").appendChild(tr);

    var td = document.createElement("td");
    td.appendChild(document.createTextNode("Дежурств: "));
    document.getElementById("prepare-shifts").appendChild(td);

    for (j=1; j<= 3*dayAmount; j++) {
        var td = document.createElement("td");
        
        var textfield = document.createElement("input");
        textfield.type = "text";
        textfield.id = "tbx" + j;
        textfield.value = "2";
        if (j%3==0 && j!=3 && j!=75 && j!=78 && j!=3*dayAmount)
            textfield.value = "1";
        textfield.className = "tbx";
        
        td.appendChild(textfield);
        document.getElementById("prepare-shifts").appendChild(td);
    }//
    
    var tr = document.createElement("tr");
    tr.id = "prepare-worker";
    document.getElementById("prepare-table").appendChild(tr);

    var td = document.createElement("td");
    td.appendChild(document.createTextNode("Смена: "));
    document.getElementById("prepare-worker").appendChild(td);

    for (j=1; j<= 3*dayAmount; j++) {
        var td = document.createElement("td");
        td.appendChild(document.createTextNode((j-1)%3==0?"д":((j-1)%3==1?"в":"н")));
        document.getElementById("prepare-worker").appendChild(td);
    }
    
    td = document.createElement("td");
    td.appendChild(document.createTextNode("Смен"));
    document.getElementById("prepare-worker").appendChild(td);
    
    for (i = 0; i<workersAmount;i++) {
    
        var tr = document.createElement("tr");
        tr.id = "prepare-worker" + i;
        document.getElementById("prepare-table").appendChild(tr);
        
        var td = document.createElement("td");
        td.appendChild(document.createTextNode("Работник "+ i + ":"));
        document.getElementById("prepare-worker"+i).appendChild(td);
        
        var shiftsQuantity = 0;
        
        for (j=1; j<= 3*dayAmount; j++) {
            var td = document.createElement("td");
            var input = document.createElement("input");
            input.type = "checkbox";
            input.id = i + "cbx" + j;
            input.className = "chbx";
            td.appendChild(input);
            document.getElementById("prepare-worker"+i).appendChild(td);
        }
        
        td = document.createElement("td");
        td.className = "shifts-quantity";
        
        var textfield = document.createElement("input");
        textfield.type = "text";
        textfield.id = "shtbx" + i;
        if (i===0)
            textfield.value = "28";
        else if (i===1)
            textfield.value = "20";
        else
            textfield.value = "33";
        textfield.className = "shtbx";
        
        td.appendChild(textfield);
        document.getElementById("prepare-worker"+i).appendChild(td);
    }
    
});

$("#submit").on("click", function(){
    if (firstWeekDay===undefined) {
        alert("Для начала введите все необходимые данные");
        return;
    }
    
    workers = [];
    shiftsByDay= [];
    
    for (j=0; j< 3*dayAmount; j++) {
        while (!(+($("#tbx" + (j+1)).val())>0)) {
            alert("Неверный формат количества дежурств! Требуются натуральные числа!");
            return;
        }
        shiftsByDay[j] = +$("#tbx" + (j+1)).val();
    }
    
    shiftAmount = [];
    
    for (j=0; j< workersAmount; j++) {
        while (!(+($("#shtbx" + j).val())>0)) {
            alert("Неверный формат количества смен! Требуются натуральные числа!");
            return;
        }
        shiftAmount[j] = +$("#shtbx" + j).val();
    }

    for (i = 0; i<workersAmount;i++) {
        workers[i] = [];
        for (j=0; j< 3*dayAmount; j++) {
            workers[i][j] = ($("#" + i + "cbx" + (j+1)).is(":checked") ? vacationFine : 1);
        }
    }
    
    
    /////////////////////////////////////////////////////////////////////////////////
    
    preferences = [];
    shifts = [];
    dayOffAmount = [];
    
    for (j=0; j< workersAmount; j++)
    {
        dayOffAmount[j] = 0;
        shifts[j] = 0.9;
    }
    
    for (i = 0; i<3*dayAmount; i++) {
        shiftRelation = i/(3*dayAmount);
        
        for (j=0; j< workersAmount; j++) {
            preferences[j] = shiftRelation/shifts[j]*shiftAmount[j];
            if (i<3*(dayAmount - 1) && workers[j][i]!=vacationFine && (workers[j][(i-i%3)+3] == vacationFine || workers[j][(i-i%3)+4] == vacationFine || workers[j][(i-i%3)+5] == vacationFine)) workers[j][i] = (workers[j][i]/1.7).toFixed(1);
            console.log("Работник: " + j + ", смена: " + i + ", предпочтительность: " + preferences[j] + ", s: " + shifts[j] + ", sA: " + shiftAmount[j]);
        }
        
        var maximums = [];
        
        maximums[0] = [preferences[0]/workers[0][i], 0]; //максимум, индекс
        for (j=1; j< shiftsByDay[i]; j++)
            maximums[j] = [0, 0];
        
        console.log("Итоговый коэффициент работника " + 0 + ": " + preferences[0]/workers[0][i]);
        for (j=1; j< workersAmount; j++) {
            console.log("Итоговый коэффициент работника " + j + ": " + preferences[j]/workers[j][i]);
            var t=0;
            while (t<shiftsByDay[i] && preferences[j]/workers[j][i]<maximums[t][0])
                t++;
            for (var y=shiftsByDay[i]-1; y > t; y--)
                maximums[y] = maximums[y-1];
            
//            console.log("Длина массива до t: " + maximums.length);
            if (t<shiftsByDay[i])
                maximums[t] = [preferences[j]/workers[j][i], j];
            
//            console.log("Длина массива после t: " + maximums.length);
//            
//            console.log(maximums[0]);
//            console.log(maximums[1]);
//            console.log(t);
        }
        console.log(maximums);
        //console.log("Смена: " + i + ", t: " + t + ", t2: " + t2);
        for (j=0; j< maximums.length; j++) {
            if (shifts[maximums[j][1]] < 1) 
                shifts[maximums[j][1]] = 0;
            shifts[maximums[j][1]]++;
            workers[maximums[j][1]][i] = 0;
        }
        
        if (i%3==2 && i+3<3*dayAmount){ //за работу на следующий день после смены в ночь
            for (j=0; j< maximums.length; j++) {
                if (workers[maximums[j][1]][i+1] != vacationFine) workers[maximums[j][1]][i+1] = morningAfterEveningFine;
                if (workers[maximums[j][1]][i+2] != vacationFine) workers[maximums[j][1]][i+2] = morningAfterEveningFine;
                if (workers[maximums[j][1]][i+3] != vacationFine) workers[maximums[j][1]][i+3] = morningAfterEveningFine;   
            }
        }
        
        for (j=0; j< workersAmount; j++) { // раздача штрафов и приоритетов работникам
            
            if (i%3==1 && workers[j][i-1]==0 && workers[j][i]!=0) //штраф за окно
                if (workers[j][i+1] != vacationFine) workers[j][i+1] = throwOneFine;
            if (i%3==0 && workers[j][i]==0) {//приоритет доработать сутки после утра
                if (workers[j][i+1] != vacationFine) workers[j][i+1] = dayPriority;
                if (workers[j][i+2] != vacationFine) workers[j][i+2] = dayPriority;
            }
        }
    }
    
    console.log(workers);

    var table = document.getElementById("result-table");
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    
    for (j=0; j< workersAmount; j++) {
        for (i = 0; i<3*dayAmount; i+=3) {
            if (workers[j][i]!=0 && workers[j][i+1]!=0 && workers[j][i+2]!=0)
                dayOffAmount[j]++;
        }
    }
    
    //отрисовка конечной таблицы со сменами//////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    var tr = document.createElement("tr");
    tr.id = "mounth-day";
    document.getElementById("result-table").appendChild(tr);

    var td = document.createElement("td");
    td.appendChild(document.createTextNode("День месяца: "));
    document.getElementById("mounth-day").appendChild(td);

    for (j=1; j<= 3*dayAmount; j++) {
        var td = document.createElement("td");
        if (!(j % 3)) { 
            td.appendChild(document.createElement("pre").appendChild(document.createTextNode(((j - j%3)/3) + "\n" + weekDays[((firstWeekDay + (j - j%3)/3 - 1)%7)])));
            td.className = "day kday";
        } else {
            td.appendChild(document.createTextNode(" "));
            td.className = "day";
        }
        document.getElementById("mounth-day").appendChild(td);
    }
    
    var tr = document.createElement("tr");
    tr.id = "worker";
    document.getElementById("result-table").appendChild(tr);

    var td = document.createElement("td");
    td.appendChild(document.createTextNode("Смена: "));
    document.getElementById("worker").appendChild(td);

    for (j=1; j<= 3*dayAmount; j++) {
        var td = document.createElement("td");
        td.appendChild(document.createTextNode((j-1)%3==0?"д":((j-1)%3==1?"в":"н")));
        document.getElementById("worker").appendChild(td);
    }
    
    td = document.createElement("td");
    td.appendChild(document.createTextNode("Смен:"));
    document.getElementById("worker").appendChild(td);
    
    td = document.createElement("td");
    td.appendChild(document.createTextNode("Выходных:"));
    document.getElementById("worker").appendChild(td);
    
    for (i = 0; i<workersAmount;i++) {
    
        var tr = document.createElement("tr");
        tr.id = "worker" + i;
        document.getElementById("result-table").appendChild(tr);
        
        var td = document.createElement("td");
        td.appendChild(document.createTextNode("Работник "+ i + ":"));
        document.getElementById("worker"+i).appendChild(td);
        
        var shiftsQuantity = 0;
        
        for (j=1; j<= 3*dayAmount; j++) {
            var td = document.createElement("td");
            if (workers[i][j-1] === 0) {
                td.className = "green";
                shiftsQuantity++;
            }
            else if (workers[i][j-1] == vacationFine) {
                td.appendChild(document.createTextNode("X"));
                td.className = "red";
            }
            else {
                td.appendChild(document.createTextNode("!"));
                td.className = "white";
            }
            document.getElementById("worker"+i).appendChild(td);
        }
        
        td = document.createElement("td");
        td.className = "shifts-quantity";
        td.appendChild(document.createTextNode(shiftsQuantity));
        document.getElementById("worker"+i).appendChild(td);
        
        td = document.createElement("td");//выходные
        td.className = "shifts-quantity";
        td.appendChild(document.createTextNode(dayOffAmount[i]));
        document.getElementById("worker"+i).appendChild(td);
    }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////