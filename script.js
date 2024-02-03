// class for the Elevator management system, creating ui
class EMS {
  constructor() {
    this.floors = 6;
    this.numElev = 2;
    this.elevators = [];
    // HTML for elevators
    this.elevDocs = document.getElementsByClassName("elevator");
    this.create_elevators();
    // Create floor buttons and add event listeners
    this.floorButtons = new FloorButtons(document.getElementsByClassName("building")[0]);
    this.floorButtons.addEventListeners();
  }

  create_elevators() {
    for (var i = 0; i < this.numElev; i++) {
      this.elevators.push(new Elevator(i + 1, this.elevDocs[i]));
    }
  }

  request(floor, elevN = null) {

    if (floor < 1 || floor > this.floors) {
      console.log(`Invalid floor. Please enter a number between 1 and ${this.floors}.`);
    }

    var flag = false;
    // Checks if this is a custom request
    if (elevN == null){
      // If not a custom request, check if an elevator is already on that floor
      for (var i = 0; i < this.numElev; i++) {
        if (this.elevators[i].getFloor() == floor) {
          flag = true;
          break;
        }
      }
    }
    // Checks if already on floor
    if (flag) {
      console.log(`Elevator already on ${floor} or on the way`);
    } else {
      console.log(`You have requested to go to floor ${floor}.`);
      console.log(elevN);
      // Find closest elevator unless it's specified
      let closestElev;
      if (elevN == null) {
        closestElev = this.find_closest(floor);
      } else {
        closestElev = this.elevators[elevN];
      }
      closestElev.queue.push(floor);
      if (!closestElev.isMoving && !closestElev.isDoorOpen){
        closestElev.move(closestElev.queue.shift());
      }
    }
  }

  find_closest(floor) {
    var closestElev = this.elevators[0];
    var currMin = Math.abs(closestElev.getFloor() - floor);
    var check = 0;
    for (var i = 1; i < this.numElev; i++) {
      check = Math.abs(this.elevators[i].getFloor() - floor);
      if (check < currMin) {
        closestElev = this.elevators[i];
        currMin = check;
      }
    }
    console.log(`Closest elev is ${closestElev.elevNum}`);
    return closestElev;
  }
}
// elevator to simulate its functions
class Elevator {
  constructor(elevNum, elevDoc) {
    this.elevNum = elevNum;
    this.elevDoc = elevDoc;
    console.log(`bruh${this.elevDoc}`);
    // HTML of each door
    this.leftDoor = this.elevDoc.getElementsByClassName("door door-left")[0];
    this.rightDoor = this.elevDoc.getElementsByClassName("door door-right")[0];
    // to simulate movement of doors
    this.speed = 200; // in milliseconds
    this.doorTime = 2000; // in milliseconds
    this.currentFloor = 1;
    this.isMoving = false;
    this.movingTo = 1;
    this.isDoorOpen = false;
    // stores elevator floor requests
    this.queue = [];
    // Control Panel init
    this.controlPanel = new ControlPanel(elevNum-1);
    this.controlPanel.addEventOpenClose(elevNum-1);
  }



  // move method, will simulate up or down using translate
  move(floor) {
    this.isMoving = true;
    this.movingTo = floor;
    console.log(`Elevator ${this.elevNum} moving from floor ${this.currentFloor} to floor ${floor}...`);
    setTimeout(() => {
      this.elevDoc.style.transform = `translateY(${(floor-1) * -100}px)`;
      this.isMoving = false;
      this.currentFloor = floor;
      console.log(`Elevator ${this.elevNum} has arrived at floor       ${this.currentFloor}.`);
      this.openDoor();
    }, this.speed);

  }
  // change to width to simulate opening door
  openDoor() {
    this.isDoorOpen = true;
    console.log(`Elevator ${this.elevNum} door opening...`);
    setTimeout(() => {
      this.leftDoor.style.transform = `scale(0,1)`;
      this.rightDoor.style.transform = `scale(0,1)`;
      this.closeDoor();
    }, this.doorTime); 
  }
// change to width to simulate closing of door
  closeDoor() {
    this.isDoorOpen = false;
    console.log(`Elevator ${this.elevNum} door closing...`);

    setTimeout(() => {
      this.leftDoor.style.transform = `scale(1,1)`;
      this.rightDoor.style.transform = `scale(1,1)`;
    }, this.doorTime)

    setTimeout(() => {
      if (this.queue.length > 0) {
      this.move(this.queue.shift());
      }
    }, 4000)
  }
  // calculate the floor for optimal elevator and which one to choose
  getFloor() {
    if (this.isMoving){
      return this.movingTo;
    } else {
      return this.currentFloor;
    }
  }
}

// Class for control panel of each elevator
class ControlPanel {
  constructor(elevNum) {
    this.controlPanel = document.getElementsByClassName("control")[elevNum];
    this.floorButtons = new FloorButtons(this.controlPanel);
    this.floorButtons.addEventListeners(elevNum);
    this.emergencyButton = this.controlPanel.getElementsByClassName("emergencyBtn")[0];
    // Add emergency button listener
    this.addEmergencyListener();
  }
  addEventOpenClose(elevNum) {
    // Add event listeners for open/close button
    let openButton = this.controlPanel.getElementsByClassName("openBtn")[0];
    openButton.addEventListener("click", () => {
        ems.elevators[elevNum].openDoor();
    })
    let closeButton = this.controlPanel.getElementsByClassName("closeBtn")[0];
    closeButton.addEventListener("click", () => {
        ems.elevators[elevNum].closeDoor();
    })
  }
  addEmergencyListener(){
    this.emergencyButton.addEventListener("click", () => {
        alert('Emergency button pressed. Security has been alerted.'); 
        location.reload();
    })
  }
}

class FloorButtons {
  constructor(doc) {
    // Get HTML for the floor buttons
    this.floorButtons = doc.getElementsByClassName("btn");
  }
  addEventListeners(elevNum=null) {
    // Add Event Listener for Floor Buttons
    Array.prototype.forEach.call (this.floorButtons, (button) => {
      button.addEventListener("click", () => {
        if (elevNum == null) {
        ems.request(button.innerText);
        } else {
          ems.request(button.innerText, elevNum);
        }
      })
    })
  }
}

const ems = new EMS();

class TestFloorButtonsRequest {
  constructor() {
  this.buttons = document.getElementsByClassName("building")[0].getElementsByClassName("btn");
  }

  testCase1() {
    // 1
    this.buttons[5].click();
    // 2
    setTimeout(() => {
      // 3
      this.buttons[4].click();
      // 4
      this.buttons[1].click();
    }, 5000);

    setTimeout(() => {
      // Check for expected result
      if (ems.elevators[0].getFloor() == 5 && ems.elevators[1].getFloor() == 2){
        console.log("Test Case 1 Passed");
      } else {
        console.log("Test Case 1 Failed");
      }
    }, 10000);
  }

  testCase2(){
    // 1
    this.buttons[4].click();
    // 2
    this.buttons[3].click();
    // 3
    this.buttons[1].click();

    setTimeout(() => {
      // Check for expected result
      if (ems.elevators[0].getFloor() == 4 && ems.elevators[1].getFloor() == 2){
        console.log("Test Case 2 Passed");
      } else {
        console.log("Test Case 2 Failed");
      }
    }, 10000);
  }

  testCase3(){
    // 1
    this.buttons[4].click();
    // 2
    setTimeout(() => {
      // 3
      this.buttons[1].click();
      // 4
      setTimeout(() => {
        // 5
        this.buttons[5].click();
        // 6
        this.buttons[0].click();
      }, 5000);

      setTimeout(() => {
        // Check for expected result
        if (ems.elevators[0].getFloor() == 6 && ems.elevators[1].getFloor() == 1){
          console.log("Test Case 3 Passed");
        } else {
          console.log("Test Case 3 Failed");
        }
      }, 10000);
    }, 5000);
  }
}

class TestRequestFromControl {
  constructor() {
  this.elevOneButtons =  document.getElementsByClassName("control")[0].getElementsByClassName("btn");
  this.elevTwoButtons =  document.getElementsByClassName("control")[1].getElementsByClassName("btn");
  }

  testCase1(){
    // 1
    this.elevOneButtons[3].click();
    // 2
    this.elevTwoButtons[1].click();

    setTimeout(() => {
        // Check for expected result
        if (ems.elevators[0].getFloor() == 4 && ems.elevators[1].getFloor() == 2){
          console.log("Test Case 1 Passed");
        } else {
          console.log("Test Case 1 Failed");
        }
      }, 10000);
  }

  testCase2(){
    // 1
    this.elevOneButtons[3].click();
    // 2
    this.elevTwoButtons[3].click();
    // 3
    this.elevOneButtons[1].click();
    // 2
    this.elevTwoButtons[2].click();

    setTimeout(() => {
        // Check for expected result
        if (ems.elevators[0].getFloor() == 2 && ems.elevators[1].getFloor() == 3){
          console.log("Test Case 2 Passed");
        } else {
          console.log("Test Case 2 Failed");
        }
      }, 10000);
  }
}

class TestEmergency {
  constructor() {
  this.buttons = document.getElementsByClassName("building")[0].getElementsByClassName("btn");
  this.emergencyButton = document.getElementsByClassName("control")[0].getElementsByClassName("emergencyBtn")[0];
  }

  testCase1() {
    // 1
    this.buttons[3].click();
    // 2
    this.buttons[1].click();
    // 3
    setTimeout(() => {
      this.emergencyButton.click();
    }, 5000);

    setTimeout(() => {
        // Check for expected result
        if (ems.elevators[0].getFloor() == 1 && ems.elevators[1].getFloor() == 1){
          console.log("Test Case 1 Passed");
        } else {
          console.log("Test Case 1 Failed");
        }
      }, 10000);
  }

}

class TestDoor {
  constructor() {
  this.buttons = document.getElementsByClassName("building")[0].getElementsByClassName("btn");
  this.elevOneOpen = document.getElementsByClassName("control")[0].getElementsByClassName("openBtn")[0];
  this.elevOneClose = document.getElementsByClassName("control")[0].getElementsByClassName("closeBtn")[0];
  this.elevTwoOpen = document.getElementsByClassName("control")[1].getElementsByClassName("openBtn")[0];
  this.elevTwoClose = document.getElementsByClassName("control")[1].getElementsByClassName("closeBtn")[0];
  }

  testCase1() {
    // 1
    this.buttons[4].click();
    // 2
    setTimeout(() => {
      // 3
      this.buttons[1].click();
      // 4
      setTimeout(() => {
        // 5
        this.elevOneClose.click();
        setTimeout(() => {
          // 6
          this.elevTwoOpen.click();
        }, 2000);
      }, 1000);
    }, 5000);

    // No real way to test except looking at screen
  }
}

// COMMENT OUT LINES TO TEST

//const unitTest1 = new TestFloorButtonsRequest();
//unitTest1.testCase1();
// unitTest1.testCase2();
// unitTest1.testCase3();

// const unitTest2 = new TestRequestFromControl();
// unitTest2.testCase1();
// unitTest2.testCase2();

// const unitTest3 = new TestEmergency();
// unitTest3.testCase1();

// const unitTest4 = new TestDoor();
// unitTest4.testCase1();
