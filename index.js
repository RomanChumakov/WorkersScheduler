    //Константы///////////////////////////////////////////////////////////////////////////////
var weekDays = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"],
    vacationFine = 30, //штраф за работу в день, в который работник не должен работать (отпуск, болезнь и т.д.)
    morningAfterEveningFine = 19, //штраф за работу после ночной смены
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
    shifts = [],      // "отработанные" смены по работникам
    dayOffAmount = [],// количество выходных по работникам
    shiftRelation = 0,// отношение прошедших смен ко всем сменам месяца
    vacationAmount = [],//количество дней отпуска по работникам

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
    
//    var td = document.createElement("td");
//    td.appendChild(document.createTextNode(""));
//    document.getElementById("prepare-mounth-day").appendChild(td);

    for (j=1; j<= 3*dayAmount; j++) 
        if (!(j % 3)) {
            var td = document.createElement("td"); 
            td.appendChild(document.createElement("pre").appendChild(document.createTextNode(((j - j%3)/3) + "\n" + weekDays[((firstWeekDay + (j - j%3)/3 - 1)%7)])));
            td.width = 10;
            document.getElementById("prepare-mounth-day").appendChild(td);
    }
    
    td = document.createElement("td");
    td.appendChild(document.createTextNode("Смен"));
    document.getElementById("prepare-mounth-day").appendChild(td);
    
    var tr = document.createElement("tr");
    tr.id = "prepare-shifts1";
    document.getElementById("prepare-table").appendChild(tr);
    
    var tr = document.createElement("tr");
    tr.id = "prepare-shifts2";
    document.getElementById("prepare-table").appendChild(tr);
    
    var tr = document.createElement("tr");
    tr.id = "prepare-shifts3";
    document.getElementById("prepare-table").appendChild(tr);

    var td = document.createElement("td");
    td.appendChild(document.createTextNode("Дежурств: "));
    document.getElementById("prepare-shifts1").appendChild(td);
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(""));
    document.getElementById("prepare-shifts2").appendChild(td);
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(""));
    document.getElementById("prepare-shifts3").appendChild(td);
    
//    var td = document.createElement("td");
//    td.appendChild(document.createTextNode(""));
//    document.getElementById("prepare-shifts1").appendChild(td);
//    var td = document.createElement("td");
//    td.appendChild(document.createTextNode(""));
//    document.getElementById("prepare-shifts2").appendChild(td);
//    var td = document.createElement("td");
//    td.appendChild(document.createTextNode(""));
//    document.getElementById("prepare-shifts3").appendChild(td);

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
        if (j%3==1)
            document.getElementById("prepare-shifts1").appendChild(td);
        else if (j%3==2)
            document.getElementById("prepare-shifts2").appendChild(td);
        else
            document.getElementById("prepare-shifts3").appendChild(td);
    }

    document.getElementById("prepare-shifts1").appendChild(document.createElement("td"));
    document.getElementById("prepare-shifts2").appendChild(document.createElement("td"));
    document.getElementById("prepare-shifts3").appendChild(document.createElement("td"));
    
    for (i = 0; i<workersAmount;i++) {
    
        var tr = document.createElement("tr");
        tr.id = "1prepare-worker" + i;
        document.getElementById("prepare-table").appendChild(tr);
        var tr = document.createElement("tr");
        tr.id = "2prepare-worker" + i;
        document.getElementById("prepare-table").appendChild(tr);
        var tr = document.createElement("tr");
        tr.id = "3prepare-worker" + i;
        document.getElementById("prepare-table").appendChild(tr);
        
        var td = document.createElement("td");
        td.appendChild(document.createTextNode("Работник "+ i + ":"));
        document.getElementById("1prepare-worker"+i).appendChild(td);
        var td = document.createElement("td");
        td.appendChild(document.createTextNode(""));
        document.getElementById("2prepare-worker"+i).appendChild(td);
        var td = document.createElement("td");
        td.appendChild(document.createTextNode(""));
        document.getElementById("3prepare-worker"+i).appendChild(td);
        
//        var input = document.createElement("input");
//        input.type = "button";
//        input.id = i + "-cbx-worker";
//        input.className = "btn-item chbx-worker";
//        td.appendChild(input);
//        
//        var td = document.createElement("td");
//        td.appendChild(input);
//        document.getElementById("1prepare-worker"+i).appendChild(td);
//        var td = document.createElement("td");
//        td.appendChild(document.createTextNode(""));
//        document.getElementById("2prepare-worker"+i).appendChild(td);
//        var td = document.createElement("td");
//        td.appendChild(document.createTextNode(""));
//        document.getElementById("3prepare-worker"+i).appendChild(td);
        
        var shiftsQuantity = 0;
        
        for (j=1; j<= 3*dayAmount; j++) {
            var td = document.createElement("td");
            var input = document.createElement("input");
            input.type = "button";
            input.id = i + "-btn-" + j;
            input.className = "btn-item white";
            td.appendChild(input);
            if (j%3==1)
                document.getElementById("1prepare-worker"+i).appendChild(td);
            else if (j%3==2)
                document.getElementById("2prepare-worker"+i).appendChild(td);
            else
                document.getElementById("3prepare-worker"+i).appendChild(td);
        }
        
        td = document.createElement("td");
        td.className = "shifts-quantity";
        
        var textfield = document.createElement("input");
        textfield.type = "text";
        textfield.id = "shtbx" + i;
        textfield.value = "33";
        textfield.className = "shtbx";
        
        td.appendChild(textfield);
        document.getElementById("1prepare-worker"+i).appendChild(td);
        document.getElementById("2prepare-worker"+i).appendChild(document.createElement("td"));
        document.getElementById("3prepare-worker"+i).appendChild(document.createElement("td"));
    }
    
//    $(".chbx-worker").on("click", function(event) {
//        var u = event.target.id.split('-')[0];
//        for (j=1; j<= 3*dayAmount; j++)
//            document.getElementById(u + "-btn-" + j).checked = !(document.getElementById(u + "cbx" + j).checked);
//    });
    
    $(".btn-item").on("click", function(event) {
        if (event.target.className == "btn-item red")
            event.target.className = "btn-item white";
        else if (event.target.className == "btn-item white")
            event.target.className = "btn-item green";
        else
            event.target.className = "btn-item red";
    });
});

$("#submit").on("click", function(){
    
    //очистка массивов для перерисовки
    workers = [];
    shiftsByDay= [];
    shiftAmount = [];
    
    //проверки входных данных и заполнение массивов
    if (firstWeekDay===undefined) {
        alert("Для начала введите все необходимые данные");
        return;
    }
    for (j=0; j< 3*dayAmount; j++) {
        while (!(+($("#tbx" + (j+1)).val())>0)) {
            alert("Неверный формат количества дежурств! Требуются натуральные числа!");
            return;
        }
        shiftsByDay[j] = +$("#tbx" + (j+1)).val();
    }
    for (j=0; j< workersAmount; j++) {
        while (!(+($("#shtbx" + j).val())>0)) {
            alert("Неверный формат количества смен! Требуются натуральные числа!");
            return;
        }
        shiftAmount[j] = +$("#shtbx" + j).val();
    }
    for (i = 0; i<workersAmount;i++) {
        vacationAmount[i]=0;
        workers[i] = [];
        for (j=0; j< 3*dayAmount; j++) {
            workers[i][j] = ($("#" + i + "-btn-" + (j+1))[0].className == "btn-item red" ? vacationFine :
                             $("#" + i + "-btn-" + (j+1))[0].className == "btn-item green" ? 0 : 1);
            vacationAmount[i]+=($("#" + i + "-btn-" + (j+1))[0].className == "btn-item red" ? 1 : 0);
        }
    } 
    
    //сброс массивов
    preferences = [];
    shifts = [];
    dayOffAmount = [];
    
    //инициализация выходных и отработанных смен для каждого работника (для конца таблицы)
    for (j=0; j< workersAmount; j++)
    {
        dayOffAmount[j] = 0;
        shifts[j] = 0;
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Начало алгоритма распределения смен////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    //начальная раздача коэффициентов на всю таблицу
    for (i = 0; i<3*dayAmount; i++) {
        for (j=0; j< workersAmount; j++) {
            shiftRelation = (i+1)/(3*dayAmount+1-vacationAmount[j]); //расчёт коэффициента прошедших смен ко всем сменам за вычетом выходных
            preferences[j] = shiftRelation/(shifts[j]+1)*(shiftAmount[j]); //расчёт предпочтения как отношения отношения смен к отработанным сменам и умноженного на общее количество смен для работника
            if (i<3*(dayAmount - 1) && workers[j][i]!=vacationFine && (workers[j][(i-i%3)+3] == vacationFine || workers[j][(i-i%3)+4] == vacationFine || workers[j][(i-i%3)+5] == vacationFine)) 
                workers[j][i] = (workers[j][i]/1.7); //уменьшение коэффициента работника, если он сегодня может работать, а завтра отдыхает
            
            //console.log("Работник: " + j + ", смена: " + i + ", предпочтительность: " + preferences[j] + ", см.отр: " + shifts[j] + ", sh.rel: " + shiftRelation+ + ", sh.rel: " + shiftRelation);
        }
        
        //расчёт максимумов в текущую смену
        var maximums = [];
        
        //инициализация массива максимумов и начального максимума
        maximums[0] = [preferences[0]/workers[0][i], 0]; //максимум, индекс работника
        for (j=1; j< shiftsByDay[i]; j++)
            maximums[j] = [0, 0];
        
        console.log("Итоговый коэффициент работника " + 0 + ": " + preferences[0]/workers[0][i]);
        
        for (j=1; j< workersAmount; j++) { // идём по работникам
            console.log("Итоговый коэффициент работника " + j + ": " + preferences[j]/workers[j][i]);
            var t=0;//счётчик величины массива максимумов (зависит от указанного количества дежурств)
            while (t<shiftsByDay[i] && preferences[j]/workers[j][i]<maximums[t][0]) //пролистываем все максимумы, которые больше j-того работника
                t++;
            for (var y=shiftsByDay[i]-1; y > t; y--) //сдвигаем максимумы, которые меньше j-того работника, чтобы вставить его в последовательность
                maximums[y] = maximums[y-1];
            
//            console.log("Длина массива до t: " + maximums.length);
            if (t<shiftsByDay[i])//вставляем работника
                maximums[t] = [preferences[j]/workers[j][i], j];
            
//            console.log("Длина массива после t: " + maximums.length);
//            
//            console.log(maximums[0]);
//            console.log(maximums[1]);
//            console.log(t);
        }
        //console.log(maximums);
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
        
        //за работу на следующий день после работы 2 смены подряд в предыдущий
        if (i%3==2 && i+3<3*dayAmount)
            for (j = 0; j< workersAmount; j++){
                if (workers[j][i-1] == 0 && workers[j][i-2] == 0){        
                    //console.log("Сотрудник номер: " + (maximums[j][1]+1) + " дежурил утром и днём");
                    //console.log("Смена: " + (i+1) + ", день: " + (i/3+1));
                    console.log("Работник: " + (j+1) + " работал дважды!");

                    if (workers[j][i+1] != vacationFine) workers[j][i+1] = morningAfterEveningFine;
                    if (workers[j][i+2] != vacationFine) workers[j][i+2] = morningAfterEveningFine;
                    if (workers[j][i+3] != vacationFine) workers[j][i+3] = morningAfterEveningFine;
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
        
        if (i < 3*dayAmount-1){
            console.log("Сегодня смена: " + (i+1) + " день: " + ((i-i%3)/3+1));
            for (j = 0; j<workersAmount; j++)
                console.log("Коэфф. работника " + j + " завтра равен: " + workers[j][i+1]);    
        }
    }
    
    //очистка таблицы результатов
    var table = document.getElementById("result-table");
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    
    //заполнение массива выходных дней
    for (j=0; j< workersAmount; j++) {
        for (i = 0; i<3*dayAmount; i+=3) {
            if (workers[j][i]!=0 && workers[j][i+1]!=0 && workers[j][i+2]!=0)
                dayOffAmount[j]++;
        }
    }
    
    //отрисовка конечной таблицы со сменами//////////////////////////////////////////////////////////////////////////////////////////////
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
            document.getElementById("mounth-day").appendChild(td);
        }
    }
    
    td = document.createElement("td");
    td.appendChild(document.createTextNode("Смен:"));
    document.getElementById("mounth-day").appendChild(td);
    
    td = document.createElement("td");
    td.appendChild(document.createTextNode("Выходных:"));
    document.getElementById("mounth-day").appendChild(td);
    
    
    for (i = 0; i<workersAmount;i++) {
        var tr = document.createElement("tr");
        tr.id = "1worker" + i;
        document.getElementById("result-table").appendChild(tr);
        
        var tr = document.createElement("tr");
        tr.id = "2worker" + i;
        document.getElementById("result-table").appendChild(tr);
        
        var tr = document.createElement("tr");
        tr.id = "3worker" + i;
        document.getElementById("result-table").appendChild(tr);
    
        var td = document.createElement("td");
        td.appendChild(document.createTextNode("Работник "+ i + ":"));
        document.getElementById("1worker"+i).appendChild(td);
        
        var td = document.createElement("td");
        td.appendChild(document.createTextNode(" "));
        document.getElementById("2worker"+i).appendChild(td);
        
        var td = document.createElement("td");
        td.appendChild(document.createTextNode(" "));
        document.getElementById("3worker"+i).appendChild(td);
        
        var shiftsQuantity = 0;
        
        for (j=1; j<= 3*dayAmount; j++) {
            var td = document.createElement("td");
            if (workers[i][j-1] === 0) {
                if (j%3==1)
                    td.className = "gray";
                else if (j%3==2)
                    td.className = "black";
                else
                    td.className = "red";
                shiftsQuantity++;
            }
            else if (workers[i][j-1] == vacationFine) {
                td.appendChild(document.createTextNode("X"));
                td.className = "yellow";
            }
            else {
                td.appendChild(document.createTextNode("!"));
                td.className = "white";
            }
            if (j%3==1)
                document.getElementById("1worker"+i).appendChild(td);
            else if (j%3==2)
                document.getElementById("2worker"+i).appendChild(td);
            else
                document.getElementById("3worker"+i).appendChild(td);
        }
        
        td = document.createElement("td");
        td.className = "shifts-quantity";
        td.appendChild(document.createTextNode(shiftsQuantity));
        document.getElementById("1worker"+i).appendChild(td);
        document.getElementById("2worker"+i).appendChild(document.createElement("td"));
        document.getElementById("3worker"+i).appendChild(document.createElement("td"));
        
        td = document.createElement("td");//выходные
        td.className = "shifts-quantity";
        td.appendChild(document.createTextNode(dayOffAmount[i]));
        document.getElementById("1worker"+i).appendChild(td);
        document.getElementById("2worker"+i).appendChild(document.createElement("td"));
        document.getElementById("3worker"+i).appendChild(document.createElement("td"));
    }
});