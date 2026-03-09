let expenses = [];

let totalExpense = 0;





function calculateBudget(){

let income = parseFloat(document.getElementById("income").value);

if(!income){
alert("Enter income first");
return;
}

document.getElementById("needs").innerText = income * 0.5;
document.getElementById("wants").innerText = income * 0.3;
document.getElementById("savings").innerText = income * 0.2;

}





function addExpense(){

let name = document.getElementById("expenseName").value;
let amount = parseFloat(document.getElementById("amount").value);
let category = document.getElementById("category").value;
let date = document.getElementById("date").value;

if(name=="" || amount=="" || date==""){
alert("Fill all fields");
return;
}

expenses.push({
name:name,
amount:amount,
category:category,
date:date
});

updateTable();
updateChart();

}





function updateTable(){

let table = document.getElementById("expenseTable");

table.innerHTML="";

totalExpense=0;

expenses.forEach((exp,index)=>{

totalExpense += exp.amount;

let row = `
<tr>
<td>${exp.date}</td>
<td>${exp.name}</td>
<td>${exp.category}</td>
<td>₹${exp.amount}</td>
<td><button onclick="deleteExpense(${index})">Delete</button></td>
</tr>
`;

table.innerHTML += row;

});

document.getElementById("totalExpense").innerText = totalExpense;

calculateMonthlyExpense();

}





function deleteExpense(index){

expenses.splice(index,1);

updateTable();
updateChart();

}





function calculateMonthlyExpense(){

let currentMonth = new Date().getMonth();

let monthlyTotal = 0;

expenses.forEach(e=>{

let month = new Date(e.date).getMonth();

if(month === currentMonth){
monthlyTotal += e.amount;
}

});

document.getElementById("monthlyExpense").innerText = monthlyTotal;

}





const ctx = document.getElementById("expenseChart");

let chart = new Chart(ctx,{

type:"doughnut",

data:{

labels:["Needs","Wants","Savings"],

datasets:[{

data:[0,0,0],

backgroundColor:[
"#3498db",
"#f39c12",
"#2ecc71"
]

}]

}

});



function updateChart(){

let currentMonth = new Date().getMonth();

let needs=0;
let wants=0;
let savings=0;

expenses.forEach(e=>{

let month = new Date(e.date).getMonth();

if(month === currentMonth){

if(["Groceries","Utilities","Transport","Insurance","Rent"].includes(e.category))
needs += e.amount;

else if(["Dining Out","Hobbies","Netflix","Travel","Shopping"].includes(e.category))
wants += e.amount;

else if(e.category=="Savings")
savings += e.amount;

}

});

chart.data.datasets[0].data = [needs,wants,savings];

chart.update();

}
