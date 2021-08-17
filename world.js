////Constants

//plants
let plant_index = 0;
const default_plants = 150;
const berry_hatch = 0.17;
const default_tree_life = 20;

//bird
let bird_index = 0;

//map
const length = 200;
const speed = 3;
	
var seed = Math.random() * 1000000;
var rand = new Math.seedrandom(seed);

const waterRange = document.getElementById("waterRange");
const sliderValue = document.getElementById("sliderValue");
const waterChance = document.getElementById("waterChance");
const chanceValue = document.getElementById("chanceValue");
let watermodifier = 0.125;
let waterchance = 0.003;

class Cat {
	constructor(){
	}
}

class Bird {
	constructor(sex, i, j){
		this.colors = ['white', 'black'];
		this.img = "bird.jpg";
		this.color = (sex === "male") ? colors[0] : colors[1];
		this.id = 4;
		this.index = bird_index++;
		this.position = [i, j]; 

		this.field_of_view = 10;
		this.moving_to = undefined; 
		//hunger
		this.hunger = 0;
		this.max_hunger = 100;
		this.hunger_change = 5;
		//lust
		this.lust = 0;
		this.max_lust = 50;
		this.lust_change = 2.5;
		//thirst
		this.thirst = 0;
		this.max_thirst = 100;
		this.thirst.change = 10;
	}
	
	//find TYPE on MAP
	findClosest(map, type){
			let allObj = [];
			for(let i = this.position[0] - field_of_view/2; i < this.position[0] + field_of_view/2; i++)
			{
				for(let j = this.position[1] - field_of_view/2; j < this.position[1] + field_of_view/2; j++)
				{
					if(i > 0 && i < length && j > 0 && j < length){
						if(map[i][j].type.id == type.id)allObj.push({obj: map[i][j], coordinates: [i, j]});
					}
				}
			}
			if(allObj.length != 0){
				let min = length;
				let minObj = allObj[i];
				for(i in allObj)
				{
					let distance = Math.sqrt(Math.pow(this.position[0] - allObj[i].coordinates[0], 2) + Math.pow(this.position[1] - allObj[i].coordinates[1], 2));
					if(distance < min){
						min = distance; 
						minObj = allObj[i];
					}
				}
				this.moving_to = minObj;
			}
		}
}

class Plant {
	constructor(age, i, j){
		this.colors = ['darkgreen', 'lightgreen', 'red', 'red', 'red', 'brown'];
		this.img = "grass.jpg";
		this.color = this.colors[0];
		this.id = 3;
		this.index = plant_index++;
		this.position = [i, j];
		
		this.age = age;
		this.life = default_tree_life;
		this.berry = 0;
		this.berryChange = 0.25;
		this.amount = 0;
		this.reproduce = false;
	}
	
	grow(){
		if(this.age != -1){
			this.age++; 
			//this.color = this.colors[Math.floor(this.berry)];
			if(this.age >= 12){
				this.color = "brown";
				this.reproduce = true;
				//this.berry--;
			}
			if(this.age > this.life){
				this.color = "grey";
				this.age = -1;
				this.berry = 0;
				this.amount = 0;
			}
		}
	}
	
	grow_berry(){
		if(this.age > 5 && this.age < this.life - 5){
			if(this.berry < 7){
				this.berry += 0.5;
				if(this.berry > 2)this.color = "red";
				else if(this.berry > 0)this.color = "lightgreen";
				this.amount += this.berryChange;	
			}
		}
	}
	
	evolve(){
		let magnification = (rand() * 10) % 3 - 1;
		let scope = (rand() * 20);
		this.life += magnification * scope;
		magnification = (rand() * 10) % 3 - 1;
		scope = (rand() * 20);
		this.berryChange += magnification * scope;
	}
	
}
	
	
	///////////////// TILES
function Grass(){
	this.img = "grass.jpg";
	this.color = 'green';
	this.id = 0;
}

function Water(){
	this.img = "grass.jpg";
	this.color = 'blue';
	this.id = 1;
}

function Sand(){
	this.img = "grass.jpg";
	this.color = 'yellow';
	this.id = 2;
}

function Tile(type){
	this.type = type;
	this.objects = [];
	
	this.color = function() {if(this.objects.length == 0)return this.type.color; else return this.objects[this.objects.length - 1].color;};
}
	//////////////////

class World {
	
	constructor(){	
		this.plants = [];
		this.birds = [];
		this.cats = [];
	
		this.map = new Array(length);
		for(let i = 0; i < length; i++){
			this.map[i] = new Array(100);
		}
		this.build();
		
		//timer on/off
		this.on = false;
	}
	
	build(){
		this.generate_grass();
		this.generate_water();
		//this.populate();
	}
	
	generate_grass(){
		for(let i = 0; i < length; i++){
			for(let j = 0; j < length; j++){
				this.map[i][j] = new Tile(new Grass());
			}
		}
	}
	
	generate_water(){
		for(let i = 0; i < length; i++){
			let chance = 0;
			for(let j = 0; j < length; j++){
				if(this.neighbour(i, j, new Water())){chance = 0.5;}else{chance = waterchance;}
				if(rand() <= chance)this.map[i][j] = new Tile(new Water());
			}
		}
		this.fillIn();
		this.generate_sand();
		//this.clean_sand();
	}
	
	fillIn(){
		for(let k = 0; k < 4; k++){
			for(let i = 0; i < length; i++){
				for(let j = 0; j < length; j++){
					let chance = 0;
					if(i > 0)
					{
						if(this.map[i - 1][j].type.id == (new Water()).id)chance += watermodifier;
						if(j > 0 && this.map[i - 1][j - 1].type.id == (new Water()).id)chance += watermodifier;
						if(j < length - 1 && this.map[i - 1][j + 1].type.id == (new Water()).id)chance += watermodifier;
					}
					
						if(j > 0 && this.map[i][j - 1].type.id == (new Water()).id)chance += watermodifier;
						if(j < length - 1 && this.map[i][j + 1].type.id == (new Water()).id)chance += watermodifier;
							
					if(i < length - 1)
					{
					   if(this.map[i + 1][j].type.id == (new Water()).id)chance += watermodifier;
					   if(j > 0 && this.map[i + 1][j - 1].type.id == (new Water()).id)chance += watermodifier;
					   if(j < length - 1 && this.map[i + 1][j + 1].type.id == (new Water()).id)chance += watermodifier;
					}

					if(rand() <= chance)this.map[i][j] = new Tile(new Water());
				}
			}
		}
	}
	
	clean_sand(){
		for(let i = 0; i < length; i++){
			for(let j = 0; j < length; j++){
				if(!this.deepneighbour(i, j, new Grass()) && this.map[i][j].type.id == (new Sand()).id){
					this.map[i][j] = new Tile(new Water());
				}
			}
		}
	}
	
	generate_sand(){
		for(let i = 0; i < length; i++){
			for(let j = 0; j < length; j++){
				if(this.neighbour(i, j, new Water()) && this.map[i][j].type.id != (new Water()).id){
					this.map[i][j] = new Tile(new Sand());
				}
			}
		}
	}
	
	populate(){
		let k = 0;
		let chance = 0.00001;
		while(k < default_plants){
			let found = false;
			for(let i = 0; i < length && !found; i++){
				for(let j = 0; j < length && !found; j++){
					if(this.map[i][j].type.id == 0){
						if(rand() <= chance){
							this.plants.push(new Plant(5, i , j));
							this.map[i][j] = new Tile(this.plants[k]);/////////////////////////////////////
							k++;
							found = true;
						}
					}
				}
			}
		}
	}
	
	neighbour(i, j, tile){
		if(i < 0 || j < 0 || i >= length || j>=length) return false;
		if(
			(	(i > 0 && (
				this.map[i - 1][j].type.id == tile.id ||
				(j > 0 && this.map[i - 1][j - 1].type.id == tile.id) ||
				(j < length - 1 && this.map[i - 1][j + 1].type.id == tile.id))))||
		   this.map[i][j].type.id == tile.id ||
		   (j > 0 && this.map[i][j - 1].type.id == tile.id) ||
		   (j < length - 1 && this.map[i][j + 1].type.id == tile.id) ||
		   (	(i < length - 1 && (
				   this.map[i + 1][j].type.id == tile.id ||
				   (j > 0 && this.map[i + 1][j - 1].type.id == tile.id) ||
				   (j < length - 1 && this.map[i + 1][j + 1].type.id == tile.id))
				)
		   )
		   
		   )
		 return true;
		return false;
	}
	
	deepneighbour(i, j, tile){
		for(let k = -1; k <= 1; k++){
			for(let l = -1; l <= 1; l ++){
				if(this.neighbour(i + k, j + l, tile) && !(k == 0 && l == 0))return true;
			}
		}
		return false;
	}
	
	tored(){
		let ind = Math.floor(rand() * 150);
		this.plants[ind].color = "red";
		this.draw();
	}
	
	start(){
		this.timer = setInterval(this.life, speed);
	}
	
	stop(){
		clearInterval(this.timer);
	}
	
	life(){
		let currentPlants = this.plants.length;
		for(let i = 0; i < currentPlants; i++){
			this.plants[i].grow();
			this.plants[i].grow_berry();
			//if bees and flowers
			if(this.plants[i].reproduce)
			{
				//this.map[this.plants[i].position[0], this.plants[i].position[1]];
				if(this.plants[i].amount > 0){
					this.plants[i].amount--;
					let randomIMod = Math.floor((rand() * 10) % 3 - 1);
					let randomJMod = Math.floor((rand() * 10) % 3 - 1);
					//find a place for a seed
					if(this.plants[i].position[0] + randomIMod > 0 && this.plants[i].position[0] + randomIMod < length && this.plants[i].position[1] + randomJMod > 0 && this.plants[i].position[1] + randomJMod < length)
					{
						if(this.map[this.plants[i].position[0] + randomIMod][this.plants[i].position[1] + randomJMod].type.id == (new Grass()).id || (randomIMod == 0 && randomJMod == 0))
						{
							//
							if(rand() <= berry_hatch){
								this.plants.push(new Plant(0, this.plants[i].position[0] + randomIMod, this.plants[i].position[1] + randomJMod));
								this.map[this.plants[i].position[0] + randomIMod][this.plants[i].position[1] + randomJMod] = new Tile(this.plants[this.plants.length - 1]);
								this.plants[this.plants.length - 1].evolve();
							}
						}
					}
				}
			}
			//if dead
			
			if(this.plants[i].age < 0)
			{
				//if same tree
				//if(this.map[this.plants[i].position[0]][this.plants[i].position[1]].type.index == this.plants[i].index){
					this.map[this.plants[i].position[0]][this.plants[i].position[1]] = new Tile(new Grass());
				//}
				this.plants.splice(i, 1);
				i--;
				currentPlants--;
			}
		}
		this.draw();
	}
	
	//(Math.random() * 10) % 3 - 1;
	
	draw(){
		console.log(rand())
		document.getElementById("table").innerHTML = "";
		let table = document.createElement("table");
		for(let i in this.map){
			let row = document.createElement("tr");
			for(let j in this.map[i]){
				let cell = document.createElement("td");
				cell.style.backgroundColor = this.map[i][j].color();
				row.appendChild(cell);
			}
			table.appendChild(row);
		}
		document.getElementById("table").appendChild(table);
	}
}

let w = new World();
w.draw();
waterRange.oninput = function(){
	rand = new Math.seedrandom(seed);
	watermodifier = parseFloat(waterRange.value);
	sliderValue.innerHTML = watermodifier;
	w.build();
	w.draw();
}
waterChance.oninput = function(){
	rand = new Math.seedrandom(seed);
	waterchance = waterChance.value;
	chanceValue.innerHTML = waterchance;
	w.build();
	w.draw();
}
document.getElementById("cleaner").onclick = function(){
	w.clean_sand();
	w.draw();
}

//document.onclick = switchOnOff;

let timer; 

function switchOnOff(){
	if(w.on == true){clearInterval(timer); w.on = false;}
	else {timer = setInterval(function(){w.life()}, speed); w.on = true;};
	console.log(w.on);
}

//w.start();