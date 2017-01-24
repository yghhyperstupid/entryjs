var Entry = {block:{}, TEXT_ALIGN_CENTER:0, TEXT_ALIGN_LEFT:1, TEXT_ALIGN_RIGHT:2, TEXT_ALIGNS:["center", "left", "right"], clipboard:null, loadProject:function(a) {
  a || (a = Entry.getStartProject(Entry.mediaFilePath));
  "workspace" == this.type && Entry.stateManager.startIgnore();
  Entry.projectId = a._id;
  Entry.variableContainer.setVariables(a.variables);
  Entry.variableContainer.setMessages(a.messages);
  Entry.scene.addScenes(a.scenes);
  Entry.stage.initObjectContainers();
  Entry.variableContainer.setFunctions(a.functions);
  Entry.container.setObjects(a.objects);
  Entry.FPS = a.speed ? a.speed : 60;
  createjs.Ticker.setFPS(Entry.FPS);
  "workspace" == this.type && setTimeout(function() {
    Entry.stateManager.endIgnore();
  }, 300);
  Entry.engine.projectTimer || Entry.variableContainer.generateTimer();
  0 === Object.keys(Entry.container.inputValue).length && Entry.variableContainer.generateAnswer();
  Entry.start();
  Entry.Loader.isLoaded() && Entry.Loader.handleLoad();
  return a;
}, clearProject:function() {
  Entry.stop();
  Entry.projectId = null;
  Entry.variableContainer.clear();
  Entry.container.clear();
  Entry.scene.clear();
}, exportProject:function(a) {
  a || (a = {});
  Entry.engine.isState("stop") || Entry.engine.toggleStop();
  Entry.Func && Entry.Func.workspace && Entry.Func.workspace.visible && Entry.Func.cancelEdit();
  a.objects = Entry.container.toJSON();
  a.scenes = Entry.scene.toJSON();
  a.variables = Entry.variableContainer.getVariableJSON();
  a.messages = Entry.variableContainer.getMessageJSON();
  a.functions = Entry.variableContainer.getFunctionJSON();
  a.scenes = Entry.scene.toJSON();
  a.speed = Entry.FPS;
  return a;
}, setBlockByText:function(a, b) {
  a = [];
  b = jQuery.parseXML(b).getElementsByTagName("category");
  for (var c = 0;c < b.length;c++) {
    for (var d = b[c], e = {category:d.getAttribute("id"), blocks:[]}, d = d.childNodes, f = 0;f < d.length;f++) {
      var g = d[f];
      !g.tagName || "BLOCK" != g.tagName.toUpperCase() && "BTN" != g.tagName.toUpperCase() || e.blocks.push(g.getAttribute("type"));
    }
    a.push(e);
  }
  Entry.playground.setBlockMenu(a);
}, setBlock:function(a, b) {
  Entry.playground.setMenuBlock(a, b);
}, enableArduino:function() {
}, initSound:function(a) {
  a.path = a.fileurl ? a.fileurl : Entry.defaultPath + "/uploads/" + a.filename.substring(0, 2) + "/" + a.filename.substring(2, 4) + "/" + a.filename + a.ext;
  Entry.soundQueue.loadFile({id:a.id, src:a.path, type:createjs.LoadQueue.SOUND});
}, beforeUnload:function(a) {
  Entry.hw.closeConnection();
  Entry.variableContainer.updateCloudVariables();
  if ("workspace" == Entry.type && (localStorage && Entry.interfaceState && localStorage.setItem("workspace-interface", JSON.stringify(Entry.interfaceState)), !Entry.stateManager.isSaved())) {
    return Lang.Workspace.project_changed;
  }
}, loadInterfaceState:function() {
  if ("workspace" == Entry.type) {
    if (localStorage && localStorage.getItem("workspace-interface")) {
      var a = localStorage.getItem("workspace-interface");
      this.resizeElement(JSON.parse(a));
    } else {
      this.resizeElement({menuWidth:280, canvasWidth:480});
    }
  }
}, resizeElement:function(a) {
  if ("workspace" == Entry.type) {
    var b = this.interfaceState;
    !a.canvasWidth && b.canvasWidth && (a.canvasWidth = b.canvasWidth);
    !a.menuWidth && this.interfaceState.menuWidth && (a.menuWidth = b.menuWidth);
    Entry.engine.speedPanelOn && Entry.engine.toggleSpeedPanel();
    (b = a.canvasWidth) ? 325 > b ? b = 325 : 720 < b && (b = 720) : b = 400;
    a.canvasWidth = b;
    var c = 9 * b / 16;
    Entry.engine.view_.style.width = b + "px";
    Entry.engine.view_.style.height = c + "px";
    Entry.engine.view_.style.top = "40px";
    Entry.stage.canvas.canvas.style.width = b + "px";
    400 <= b ? Entry.engine.view_.removeClass("collapsed") : Entry.engine.view_.addClass("collapsed");
    Entry.playground.view_.style.left = b + .5 + "px";
    Entry.propertyPanel.resize(b);
    var d = Entry.engine.view_.getElementsByClassName("entryAddButtonWorkspace_w")[0];
    d && (Entry.objectAddable ? (d.style.top = c + 24 + "px", d.style.width = .7 * b + "px") : d.style.display = "none");
    if (d = Entry.engine.view_.getElementsByClassName("entryRunButtonWorkspace_w")[0]) {
      Entry.objectAddable ? (d.style.top = c + 24 + "px", d.style.left = .7 * b + "px", d.style.width = .3 * b + "px") : (d.style.left = "2px", d.style.top = c + 24 + "px", d.style.width = b - 4 + "px");
    }
    if (d = Entry.engine.view_.getElementsByClassName("entryStopButtonWorkspace_w")[0]) {
      Entry.objectAddable ? (d.style.top = c + 24 + "px", d.style.left = .7 * b + "px", d.style.width = .3 * b + "px") : (d.style.left = "2px", d.style.top = c + 24 + "px", d.style.width = b + "px");
    }
    (b = a.menuWidth) ? 244 > b ? b = 244 : 400 < b && (b = 400) : b = 264;
    a.menuWidth = b;
    $(".blockMenuContainer").css({width:b - 64 + "px"});
    $(".blockMenuContainer>svg").css({width:b - 64 + "px"});
    Entry.playground.mainWorkspace.blockMenu.setWidth();
    $(".entryWorkspaceBoard").css({left:b + "px"});
    Entry.playground.resizeHandle_.style.left = b + "px";
    Entry.playground.variableViewWrapper_.style.width = b + "px";
    this.interfaceState = a;
  }
  Entry.windowResized.notify();
}, getUpTime:function() {
  return (new Date).getTime() - this.startTime;
}, addActivity:function(a) {
  Entry.stateManager && Entry.stateManager.addActivity(a);
}, startActivityLogging:function() {
  Entry.reporter && Entry.reporter.start(Entry.projectId, window.user ? window.user._id : null, Entry.startTime);
}, getActivityLog:function() {
  var a = {};
  Entry.stateManager && (a.activityLog = Entry.stateManager.activityLog_);
  return a;
}, DRAG_MODE_NONE:0, DRAG_MODE_MOUSEDOWN:1, DRAG_MODE_DRAG:2, cancelObjectEdit:function(a) {
  var b = Entry.playground.object;
  if (b) {
    var c = a.target, d = 0 !== $(b.view_).find(c).length, c = c.tagName.toUpperCase();
    a = a.type;
    !b.isEditing || "INPUT" === c && d || "touchstart" === a || b.editObjectValues(!1);
  }
}, generateFunctionSchema:function(a) {
  a = "func_" + a;
  if (!Entry.block[a]) {
    var b = function() {
    };
    b.prototype = Entry.block.function_general;
    b = new b;
    b.changeEvent = new Entry.Event;
    b.template = Lang.template.function_general;
    Entry.block[a] = b;
  }
}, getMainWS:function() {
  var a;
  Entry.mainWorkspace ? a = Entry.mainWorkspace : Entry.playground && Entry.playground.mainWorkspace && (a = Entry.playground.mainWorkspace);
  return a;
}};
window.Entry = Entry;
Entry.Albert = {PORT_MAP:{leftWheel:0, rightWheel:0, buzzer:0, leftEye:0, rightEye:0, note:0, bodyLed:0, frontLed:0, padWidth:0, padHeight:0}, setZero:function() {
  var a = Entry.Albert.PORT_MAP, b = Entry.hw.sendQueue, c;
  for (c in a) {
    b[c] = a[c];
  }
  Entry.hw.update();
  a = Entry.Albert;
  a.tempo = 60;
  a.removeAllTimeouts();
}, monitorTemplate:{imgPath:"hw/albert.png", width:387, height:503, listPorts:{temperature:{name:Lang.Blocks.ALBERT_sensor_temperature, type:"input", pos:{x:0, y:0}}, accelerationX:{name:Lang.Blocks.ALBERT_sensor_acceleration_x, type:"input", pos:{x:0, y:0}}, accelerationY:{name:Lang.Blocks.ALBERT_sensor_acceleration_y, type:"input", pos:{x:0, y:0}}, accelerationZ:{name:Lang.Blocks.ALBERT_sensor_acceleration_z, type:"input", pos:{x:0, y:0}}, frontOid:{name:Lang.Blocks.ALBERT_sensor_front_oid, type:"input", 
pos:{x:0, y:0}}, backOid:{name:Lang.Blocks.ALBERT_sensor_back_oid, type:"input", pos:{x:0, y:0}}, positionX:{name:Lang.Blocks.ALBERT_sensor_position_x, type:"input", pos:{x:0, y:0}}, positionY:{name:Lang.Blocks.ALBERT_sensor_position_y, type:"input", pos:{x:0, y:0}}, orientation:{name:Lang.Blocks.ALBERT_sensor_orientation, type:"input", pos:{x:0, y:0}}, buzzer:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, note:{name:Lang.Hw.note, type:"output", pos:{x:0, y:0}}}, ports:{leftProximity:{name:Lang.Blocks.ALBERT_sensor_left_proximity, 
type:"input", pos:{x:178, y:401}}, rightProximity:{name:Lang.Blocks.ALBERT_sensor_right_proximity, type:"input", pos:{x:66, y:359}}, battery:{name:Lang.Blocks.ALBERT_sensor_battery, type:"input", pos:{x:88, y:368}}, light:{name:Lang.Blocks.ALBERT_sensor_light, type:"input", pos:{x:127, y:391}}, leftWheel:{name:Lang.Hw.leftWheel, type:"output", pos:{x:299, y:406}}, rightWheel:{name:Lang.Hw.rightWheel, type:"output", pos:{x:22, y:325}}, leftEye:{name:Lang.Hw.leftEye, type:"output", pos:{x:260, y:26}}, 
rightEye:{name:Lang.Hw.rightEye, type:"output", pos:{x:164, y:13}}, bodyLed:{name:Lang.Hw.body + " " + Lang.Hw.led_en, type:"output", pos:{x:367, y:308}}, frontLed:{name:Lang.Hw.front + " " + Lang.Hw.led_en, pos:{x:117, y:410}}}, mode:"both"}, tempo:60, timeouts:[], removeTimeout:function(a) {
  clearTimeout(a);
  var b = this.timeouts;
  a = b.indexOf(a);
  0 <= a && b.splice(a, 1);
}, removeAllTimeouts:function() {
  var a = this.timeouts, b;
  for (b in a) {
    clearTimeout(a[b]);
  }
  this.timeouts = [];
}, controller:{PI:3.14159265, PI2:6.2831853, prevDirection:0, prevDirectionFine:0, directionFineCount:0, positionCount:0, finalPositionCount:0, GAIN_ANGLE:30, GAIN_ANGLE_FINE:30, GAIN_POSITION_FINE:30, STRAIGHT_SPEED:20, MAX_BASE_SPEED:20, GAIN_BASE_SPEED:1, GAIN_POSITION:35, POSITION_TOLERANCE_FINE:3, POSITION_TOLERANCE_FINE_LARGE:5, POSITION_TOLERANCE_ROUGH:5, POSITION_TOLERANCE_ROUGH_LARGE:10, ORIENTATION_TOLERANCE_FINE:.08, ORIENTATION_TOLERANCE_ROUGH:.09, ORIENTATION_TOLERANCE_ROUGH_LARGE:.18, 
MINIMUM_WHEEL_SPEED:18, MINIMUM_WHEEL_SPEED_FINE:15, clear:function() {
  this.finalPositionCount = this.positionCount = this.directionFineCount = this.prevDirectionFine = this.prevDirection = 0;
}, controlAngleFine:function(a, b) {
  var c = Entry.hw.sendQueue;
  a = this.validateRadian(b - a);
  b = Math.abs(a);
  if (b < this.ORIENTATION_TOLERANCE_FINE) {
    return !1;
  }
  var d = 0 < a ? 1 : -1;
  if (0 > d * this.prevDirectionFine && 5 < ++this.directionFineCount) {
    return !1;
  }
  this.prevDirectionFine = d;
  0 < a ? (a = Math.log(1 + b) * this.GAIN_ANGLE_FINE, a < this.MINIMUM_WHEEL_SPEED && (a = this.MINIMUM_WHEEL_SPEED)) : (a = -Math.log(1 + b) * this.GAIN_ANGLE_FINE, a > -this.MINIMUM_WHEEL_SPEED && (a = -this.MINIMUM_WHEEL_SPEED));
  a = parseInt(a);
  c.leftWheel = -a;
  c.rightWheel = a;
  return !0;
}, controlAngle:function(a, b) {
  var c = Entry.hw.sendQueue;
  a = this.validateRadian(b - a);
  b = Math.abs(a);
  if (b < this.ORIENTATION_TOLERANCE_ROUGH) {
    return !1;
  }
  var d = 0 < a ? 1 : -1;
  if (b < this.ORIENTATION_TOLERANCE_ROUGH_LARGE && 0 > d * this.prevDirection) {
    return !1;
  }
  this.prevDirection = d;
  0 < a ? (a = Math.log(1 + b) * this.GAIN_ANGLE, a < this.MINIMUM_WHEEL_SPEED && (a = this.MINIMUM_WHEEL_SPEED)) : (a = -Math.log(1 + b) * this.GAIN_ANGLE, a > -this.MINIMUM_WHEEL_SPEED && (a = -this.MINIMUM_WHEEL_SPEED));
  a = parseInt(a);
  c.leftWheel = -a;
  c.rightWheel = a;
  return !0;
}, controlPositionFine:function(a, b, c, d, e) {
  var f = Entry.hw.sendQueue;
  c = this.validateRadian(Math.atan2(e - b, d - a) - c);
  var g = Math.abs(c);
  a = d - a;
  b = e - b;
  b = Math.sqrt(a * a + b * b);
  if (b < this.POSITION_TOLERANCE_FINE) {
    return !1;
  }
  if (b < this.POSITION_TOLERANCE_FINE_LARGE && 5 < ++this.finalPositionCount) {
    return this.finalPositionCount = 0, !1;
  }
  c = 0 < c ? Math.log(1 + g) * this.GAIN_POSITION_FINE : -Math.log(1 + g) * this.GAIN_POSITION_FINE;
  c = parseInt(c);
  f.leftWheel = this.MINIMUM_WHEEL_SPEED_FINE - c;
  f.rightWheel = this.MINIMUM_WHEEL_SPEED_FINE + c;
  return !0;
}, controlPosition:function(a, b, c, d, e) {
  var f = Entry.hw.sendQueue;
  c = this.validateRadian(Math.atan2(e - b, d - a) - c);
  var g = Math.abs(c);
  a = d - a;
  b = e - b;
  b = Math.sqrt(a * a + b * b);
  if (b < this.POSITION_TOLERANCE_ROUGH) {
    return !1;
  }
  if (b < this.POSITION_TOLERANCE_ROUGH_LARGE) {
    if (10 < ++this.positionCount) {
      return this.positionCount = 0, !1;
    }
  } else {
    this.positionCount = 0;
  }
  .01 > g ? (f.leftWheel = this.STRAIGHT_SPEED, f.rightWheel = this.STRAIGHT_SPEED) : (b = (this.MINIMUM_WHEEL_SPEED + .5 / g) * this.GAIN_BASE_SPEED, b > this.MAX_BASE_SPEED && (b = this.MAX_BASE_SPEED), c = 0 < c ? Math.log(1 + g) * this.GAIN_POSITION : -Math.log(1 + g) * this.GAIN_POSITION, b = parseInt(b), c = parseInt(c), f.leftWheel = b - c, f.rightWheel = b + c);
  return !0;
}, validateRadian:function(a) {
  return a > this.PI ? a - this.PI2 : a < -this.PI ? a + this.PI2 : a;
}, toRadian:function(a) {
  return 3.14159265 * a / 180;
}}, name:"albert"};
Blockly.Blocks.albert_hand_found = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_hand_found);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.albert_hand_found = function(a, b) {
  a = Entry.hw.portData;
  return 40 < a.leftProximity || 40 < a.rightProximity;
};
Blockly.Blocks.albert_is_oid_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_is_oid_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_front_oid, "FRONT"], [Lang.Blocks.ALBERT_back_oid, "BACK"]]), "OID").appendField(Lang.Blocks.ALBERT_is_oid_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_is_oid_3);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.albert_is_oid_value = function(a, b) {
  a = Entry.hw.portData;
  var c = b.getField("OID", b);
  b = b.getNumberValue("VALUE");
  return "FRONT" == c ? a.frontOid == b : a.backOid == b;
};
Blockly.Blocks.albert_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_sensor_left_proximity, "leftProximity"], [Lang.Blocks.ALBERT_sensor_right_proximity, "rightProximity"], [Lang.Blocks.ALBERT_sensor_acceleration_x, "accelerationX"], [Lang.Blocks.ALBERT_sensor_acceleration_y, "accelerationY"], [Lang.Blocks.ALBERT_sensor_acceleration_z, "accelerationZ"], [Lang.Blocks.ALBERT_sensor_front_oid, "frontOid"], [Lang.Blocks.ALBERT_sensor_back_oid, "backOid"], [Lang.Blocks.ALBERT_sensor_position_x, 
  "positionX"], [Lang.Blocks.ALBERT_sensor_position_y, "positionY"], [Lang.Blocks.ALBERT_sensor_orientation, "orientation"], [Lang.Blocks.ALBERT_sensor_light, "light"], [Lang.Blocks.ALBERT_sensor_temperature, "temperature"], [Lang.Blocks.ALBERT_sensor_battery, "battery"], [Lang.Blocks.ALBERT_sensor_signal_strength, "signalStrength"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.albert_value = function(a, b) {
  a = Entry.hw.portData;
  b = b.getField("DEVICE");
  return a[b];
};
Blockly.Blocks.albert_move_forward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_forward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_forward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_forward_for_secs = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  a.leftWheel = 30;
  a.rightWheel = 30;
  a = 1E3 * b.getNumberValue("VALUE");
  var c = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Albert.removeTimeout(c);
  }, a);
  Entry.Albert.timeouts.push(c);
  return b;
};
Blockly.Blocks.albert_move_backward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_backward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_backward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_backward_for_secs = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  a.leftWheel = -30;
  a.rightWheel = -30;
  a = 1E3 * b.getNumberValue("VALUE");
  var c = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Albert.removeTimeout(c);
  }, a);
  Entry.Albert.timeouts.push(c);
  return b;
};
Blockly.Blocks.albert_turn_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_for_secs_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_turn_left, "LEFT"], [Lang.Blocks.ALBERT_turn_right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_turn_for_secs_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_for_secs_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_turn_for_secs = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  "LEFT" == b.getField("DIRECTION", b) ? (a.leftWheel = -30, a.rightWheel = 30) : (a.leftWheel = 30, a.rightWheel = -30);
  a = 1E3 * b.getNumberValue("VALUE");
  var c = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Albert.removeTimeout(c);
  }, a);
  Entry.Albert.timeouts.push(c);
  return b;
};
Blockly.Blocks.albert_change_both_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_both_wheels_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getNumberValue("LEFT"), d = b.getNumberValue("RIGHT");
  a.leftWheel = void 0 != a.leftWheel ? a.leftWheel + c : c;
  a.rightWheel = void 0 != a.rightWheel ? a.rightWheel + d : d;
  return b.callReturn();
};
Blockly.Blocks.albert_set_both_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_both_wheels_to = function(a, b) {
  a = Entry.hw.sendQueue;
  a.leftWheel = b.getNumberValue("LEFT");
  a.rightWheel = b.getNumberValue("RIGHT");
  return b.callReturn();
};
Blockly.Blocks.albert_change_wheel_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_wheel_by_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_left_wheel, "LEFT"], [Lang.Blocks.ALBERT_right_wheel, "RIGHT"], [Lang.Blocks.ALBERT_both_wheels, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_change_wheel_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_wheel_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_wheel_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getField("DIRECTION"), d = b.getNumberValue("VALUE");
  "LEFT" == c ? a.leftWheel = void 0 != a.leftWheel ? a.leftWheel + d : d : ("RIGHT" != c && (a.leftWheel = void 0 != a.leftWheel ? a.leftWheel + d : d), a.rightWheel = void 0 != a.rightWheel ? a.rightWheel + d : d);
  return b.callReturn();
};
Blockly.Blocks.albert_set_wheel_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_wheel_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_left_wheel, "LEFT"], [Lang.Blocks.ALBERT_right_wheel, "RIGHT"], [Lang.Blocks.ALBERT_both_wheels, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_wheel_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_wheel_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_wheel_to = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getField("DIRECTION"), d = b.getNumberValue("VALUE");
  "LEFT" == c ? a.leftWheel = d : ("RIGHT" != c && (a.leftWheel = d), a.rightWheel = d);
  return b.callReturn();
};
Blockly.Blocks.albert_stop = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_stop).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_stop = function(a, b) {
  a = Entry.hw.sendQueue;
  a.leftWheel = 0;
  a.rightWheel = 0;
  return b.callReturn();
};
Blockly.Blocks.albert_set_pad_size_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_board_size_to_1);
  this.appendValueInput("WIDTH").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_board_size_to_2);
  this.appendValueInput("HEIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_board_size_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_pad_size_to = function(a, b) {
  a = Entry.hw.sendQueue;
  a.padWidth = b.getNumberValue("WIDTH");
  a.padHeight = b.getNumberValue("HEIGHT");
  return b.callReturn();
};
Blockly.Blocks.albert_move_to_x_y_on_board = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_to_x_y_1);
  this.appendValueInput("X").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_to_x_y_2);
  this.appendValueInput("Y").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_to_x_y_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_to_x_y_on_board = function(a, b) {
  var c = Entry.hw.sendQueue, d = Entry.hw.portData;
  a = Entry.Albert.controller;
  if (b.isStart) {
    if (b.isMoving) {
      0 <= d.positionX && (b.x = d.positionX);
      0 <= d.positionY && (b.y = d.positionY);
      b.theta = d.orientation;
      switch(b.boardState) {
        case 1:
          if (0 == b.initialized) {
            if (0 > b.x || 0 > b.y) {
              c.leftWheel = 20;
              c.rightWheel = -20;
              break;
            }
            b.initialized = !0;
          }
          c = a.toRadian(b.theta);
          0 == a.controlAngle(c, Math.atan2(b.targetY - b.y, b.targetX - b.x)) && (b.boardState = 2);
          break;
        case 2:
          0 == a.controlPosition(b.x, b.y, a.toRadian(b.theta), b.targetX, b.targetY) && (b.boardState = 3);
          break;
        case 3:
          0 == a.controlPositionFine(b.x, b.y, a.toRadian(b.theta), b.targetX, b.targetY) && (c.leftWheel = 0, c.rightWheel = 0, b.isMoving = !1);
      }
      return b;
    }
    delete b.isStart;
    delete b.isMoving;
    delete b.initialized;
    delete b.boardState;
    delete b.x;
    delete b.y;
    delete b.theta;
    delete b.targetX;
    delete b.targetY;
    Entry.engine.isContinue = !1;
    c.leftWheel = 0;
    c.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.isMoving = !0;
  b.initialized = !1;
  b.boardState = 1;
  b.x = -1;
  b.y = -1;
  b.theta = -200;
  b.targetX = b.getNumberValue("X");
  b.targetY = b.getNumberValue("Y");
  a.clear();
  c.leftWheel = 0;
  c.rightWheel = 0;
  return b;
};
Blockly.Blocks.albert_set_orientation_on_board = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_orientation_to_1);
  this.appendValueInput("ORIENTATION").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_orientation_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_orientation_on_board = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = Entry.hw.portData, d = Entry.Albert.controller;
  if (b.isStart) {
    if (b.isMoving) {
      b.theta = c.orientation;
      switch(b.boardState) {
        case 1:
          var c = d.toRadian(b.theta), e = d.toRadian(b.targetTheta);
          0 == d.controlAngle(c, e) && (b.boardState = 2);
          break;
        case 2:
          c = d.toRadian(b.theta), e = d.toRadian(b.targetTheta), 0 == d.controlAngleFine(c, e) && (a.leftWheel = 0, a.rightWheel = 0, b.isMoving = !1);
      }
      return b;
    }
    delete b.isStart;
    delete b.isMoving;
    delete b.boardState;
    delete b.theta;
    delete b.targetTheta;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.isMoving = !0;
  b.boardState = 1;
  b.theta = -200;
  b.targetTheta = b.getNumberValue("ORIENTATION");
  d.clear();
  a.leftWheel = 0;
  a.rightWheel = 0;
  return b;
};
Blockly.Blocks.albert_set_eye_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_eye_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_left_eye, "LEFT"], [Lang.Blocks.ALBERT_right_eye, "RIGHT"], [Lang.Blocks.ALBERT_both_eyes, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_eye_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.Blocks.ALBERT_color_cyan, "3"], [Lang.General.blue, "1"], [Lang.Blocks.ALBERT_color_magenta, 
  "5"], [Lang.Blocks.ALBERT_color_white, "7"]]), "COLOR").appendField(Lang.Blocks.ALBERT_set_eye_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_eye_to = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getField("DIRECTION", b), d = Number(b.getField("COLOR", b));
  "LEFT" == c ? a.leftEye = d : ("RIGHT" != c && (a.leftEye = d), a.rightEye = d);
  return b.callReturn();
};
Blockly.Blocks.albert_clear_eye = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_clear_eye_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_left_eye, "LEFT"], [Lang.Blocks.ALBERT_right_eye, "RIGHT"], [Lang.Blocks.ALBERT_both_eyes, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_clear_eye_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_eye = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getField("DIRECTION", b);
  "LEFT" == c ? a.leftEye = 0 : ("RIGHT" != c && (a.leftEye = 0), a.rightEye = 0);
  return b.callReturn();
};
Blockly.Blocks.albert_body_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_body_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_turn_on, "ON"], [Lang.Blocks.ALBERT_turn_off, "OFF"]]), "STATE").appendField(Lang.Blocks.ALBERT_turn_body_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_body_led = function(a, b) {
  a = Entry.hw.sendQueue;
  "ON" == b.getField("STATE", b) ? a.bodyLed = 1 : a.bodyLed = 0;
  return b.callReturn();
};
Blockly.Blocks.albert_front_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_front_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_turn_on, "ON"], [Lang.Blocks.ALBERT_turn_off, "OFF"]]), "STATE").appendField(Lang.Blocks.ALBERT_turn_front_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_front_led = function(a, b) {
  a = Entry.hw.sendQueue;
  "ON" == b.getField("STATE", b) ? a.frontLed = 1 : a.frontLed = 0;
  return b.callReturn();
};
Blockly.Blocks.albert_beep = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_beep).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_beep = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.buzzer = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  a.buzzer = 440;
  a.note = 0;
  var c = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Albert.removeTimeout(c);
  }, 200);
  Entry.Albert.timeouts.push(c);
  return b;
};
Blockly.Blocks.albert_change_buzzer_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_buzzer_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_buzzer_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_buzzer_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getNumberValue("VALUE");
  a.buzzer = void 0 != a.buzzer ? a.buzzer + c : c;
  a.note = 0;
  return b.callReturn();
};
Blockly.Blocks.albert_set_buzzer_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_buzzer_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_buzzer_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_buzzer_to = function(a, b) {
  a = Entry.hw.sendQueue;
  a.buzzer = b.getNumberValue("VALUE");
  a.note = 0;
  return b.callReturn();
};
Blockly.Blocks.albert_clear_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_clear_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_buzzer = function(a, b) {
  a = Entry.hw.sendQueue;
  a.buzzer = 0;
  a.note = 0;
  return b.callReturn();
};
Blockly.Blocks.albert_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "4"], [Lang.General.note_c + "#", "5"], [Lang.General.note_d + "", "6"], [Lang.General.note_e + "b", "7"], [Lang.General.note_e + "", "8"], [Lang.General.note_f + "", "9"], [Lang.General.note_f + "#", "10"], [Lang.General.note_g + "", "11"], [Lang.General.note_g + "#", "12"], [Lang.General.note_a + "", "13"], [Lang.General.note_b + "b", "14"], [Lang.General.note_b + 
  "", "15"]]), "NOTE").appendField(Lang.Blocks.ALBERT_play_note_for_2).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.ALBERT_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_play_note_for_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_play_note_for = function(a, b) {
  var c = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    c.note = 0;
    return b.callReturn();
  }
  a = b.getNumberField("NOTE", b);
  var d = b.getNumberField("OCTAVE", b), e = 6E4 * b.getNumberValue("VALUE", b) / Entry.Albert.tempo;
  b.isStart = !0;
  b.timeFlag = 1;
  c.buzzer = 0;
  c.note = a + 12 * (d - 1);
  if (100 < e) {
    var f = setTimeout(function() {
      c.note = 0;
      Entry.Albert.removeTimeout(f);
    }, e - 100);
    Entry.Albert.timeouts.push(f);
  }
  var g = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Albert.removeTimeout(g);
  }, e);
  Entry.Albert.timeouts.push(g);
  return b;
};
Blockly.Blocks.albert_rest_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_rest_for_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_rest_for_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_rest_for = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  var c = b.getNumberValue("VALUE"), c = 6E4 * c / Entry.Albert.tempo;
  a.buzzer = 0;
  a.note = 0;
  var d = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Albert.removeTimeout(d);
  }, c);
  Entry.Albert.timeouts.push(d);
  return b;
};
Blockly.Blocks.albert_change_tempo_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_tempo_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_tempo_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_tempo_by = function(a, b) {
  Entry.Albert.tempo += b.getNumberValue("VALUE");
  1 > Entry.Albert.tempo && (Entry.Albert.tempo = 1);
  return b.callReturn();
};
Blockly.Blocks.albert_set_tempo_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_tempo_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_tempo_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_tempo_to = function(a, b) {
  Entry.Albert.tempo = b.getNumberValue("VALUE");
  1 > Entry.Albert.tempo && (Entry.Albert.tempo = 1);
  return b.callReturn();
};
Entry.Arduino = {name:"arduino", setZero:function() {
  Entry.hw.sendQueue.readablePorts = [];
  for (var a = 0;20 > a;a++) {
    Entry.hw.sendQueue[a] = 0, Entry.hw.sendQueue.readablePorts.push(a);
  }
  Entry.hw.update();
}, monitorTemplate:{imgPath:"hw/arduino.png", width:605, height:434, listPorts:{2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 5:{name:Lang.Hw.port_en + " 5 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 6:{name:Lang.Hw.port_en + " 6 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 7:{name:Lang.Hw.port_en + 
" 7 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 8:{name:Lang.Hw.port_en + " 8 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 9:{name:Lang.Hw.port_en + " 9 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 10:{name:Lang.Hw.port_en + " 10 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 11:{name:Lang.Hw.port_en + " 11 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 12:{name:Lang.Hw.port_en + " 12 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 13:{name:Lang.Hw.port_en + " 13 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a0:{name:Lang.Hw.port_en + " A0 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a1:{name:Lang.Hw.port_en + " A1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a2:{name:Lang.Hw.port_en + " A2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a3:{name:Lang.Hw.port_en + " A3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a4:{name:Lang.Hw.port_en + " A4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a5:{name:Lang.Hw.port_en + " A5 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Entry.ArduinoExt = {name:"ArduinoExt", setZero:function() {
  Entry.hw.sendQueue.SET ? Object.keys(Entry.hw.sendQueue.SET).forEach(function(a) {
    Entry.hw.sendQueue.SET[a].data = 0;
    Entry.hw.sendQueue.SET[a].time = (new Date).getTime();
  }) : Entry.hw.sendQueue = {GET:{}, SET:{}};
  Entry.hw.update();
}, sensorTypes:{ALIVE:0, DIGITAL:1, ANALOG:2, PWM:3, SERVO_PIN:4, TONE:5, PULSEIN:6, ULTRASONIC:7, TIMER:8}, toneMap:{1:[33, 65, 131, 262, 523, 1046, 2093, 4186], 2:[35, 69, 139, 277, 554, 1109, 2217, 4435], 3:[37, 73, 147, 294, 587, 1175, 2349, 4699], 4:[39, 78, 156, 311, 622, 1245, 2849, 4978], 5:[41, 82, 165, 330, 659, 1319, 2637, 5274], 6:[44, 87, 175, 349, 698, 1397, 2794, 5588], 7:[46, 92, 185, 370, 740, 1480, 2960, 5920], 8:[49, 98, 196, 392, 784, 1568, 3136, 6272], 9:[52, 104, 208, 415, 831, 
1661, 3322, 6645], 10:[55, 110, 220, 440, 880, 1760, 3520, 7040], 11:[58, 117, 233, 466, 932, 1865, 3729, 7459], 12:[62, 123, 247, 494, 988, 1976, 3951, 7902]}, BlockState:{}};
Entry.SmartBoard = {name:"smartBoard", setZero:Entry.Arduino.setZero};
Entry.SensorBoard = {name:"sensorBoard", setZero:Entry.Arduino.setZero};
Entry.ardublock = {name:"ardublock", setZero:Entry.Arduino.setZero};
Entry.dplay = {name:"dplay", vel_value:255, Left_value:255, Right_value:255, setZero:Entry.Arduino.setZero, timeouts:[], removeTimeout:function(a) {
  clearTimeout(a);
  var b = this.timeouts;
  a = b.indexOf(a);
  0 <= a && b.splice(a, 1);
}, removeAllTimeouts:function() {
  var a = this.timeouts, b;
  for (b in a) {
    clearTimeout(a[b]);
  }
  this.timeouts = [];
}, monitorTemplate:{imgPath:"hw/dplay.png", width:500, height:600, listPorts:{2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 5:{name:Lang.Hw.port_en + " 5 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 6:{name:Lang.Hw.port_en + " 6 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 7:{name:Lang.Hw.port_en + 
" 7 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 8:{name:Lang.Hw.port_en + " 8 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 9:{name:Lang.Hw.port_en + " 9 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 10:{name:Lang.Hw.port_en + " 10 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 11:{name:Lang.Hw.port_en + " 11 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 12:{name:Lang.Hw.port_en + " 12 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 13:{name:Lang.Hw.port_en + " 13 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a0:{name:Lang.Hw.port_en + " A0 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a1:{name:Lang.Hw.port_en + " A1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a2:{name:Lang.Hw.port_en + " A2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a3:{name:Lang.Hw.port_en + " A3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a4:{name:Lang.Hw.port_en + " A4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a5:{name:Lang.Hw.port_en + " A5 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Entry.nemoino = {name:"nemoino", setZero:Entry.Arduino.setZero};
Entry.joystick = {name:"joystick", setZero:Entry.Arduino.setZero};
Entry.CODEino = {name:"CODEino", getSensorKey:function() {
  return "xxxxxxxx".replace(/[xy]/g, function(a) {
    var b = 16 * Math.random() | 0;
    return ("x" == a ? b : b & 0 | 0).toString(16);
  }).toUpperCase();
}, getSensorTime:function(a) {
  return (new Date).getTime() + a;
}, monitorTemplate:Entry.Arduino.monitorTemplate, setZero:function() {
  Entry.hw.sendQueue.SET ? Object.keys(Entry.hw.sendQueue.SET).forEach(function(a) {
    Entry.hw.sendQueue.SET[a].data = 0;
    Entry.hw.sendQueue.TIME = Entry.CODEino.getSensorTime(Entry.hw.sendQueue.SET[a].type);
    Entry.hw.sendQueue.KEY = Entry.CODEino.getSensorKey();
  }) : Entry.hw.sendQueue = {SET:{0:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 1:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 2:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 3:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 4:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 5:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 6:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 7:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 8:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 
  9:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 10:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 11:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 12:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}, 13:{type:Entry.CODEino.sensorTypes.DIGITAL, data:0}}, TIME:Entry.CODEino.getSensorTime(Entry.CODEino.sensorTypes.DIGITAL), KEY:Entry.CODEino.getSensorKey()};
  Entry.hw.update();
}, sensorTypes:{ALIVE:0, DIGITAL:1, ANALOG:2, PWM:3, RGBLED_PIN:4, TONE:5, PULSEIN:6, ULTRASONIC:7, TIMER:8, ADDCOLOR:9}, BlockState:{}};
Blockly.Blocks.arduino_text = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput("Arduino"), "NAME");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.arduino_text = function(a, b) {
  return b.getStringField("NAME");
};
Blockly.Blocks.arduino_send = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_send_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_send_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_send = function(a, b) {
  a = b.getValue("VALUE", b);
  var c = new XMLHttpRequest;
  c.open("POST", "http://localhost:23518/arduino/", !1);
  c.send(String(a));
  Entry.assert(200 == c.status, "arduino is not connected");
  return b.callReturn();
};
Blockly.Blocks.arduino_get_string = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_string_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_string_2);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_number = function(a, b) {
  a = b.getValue("VALUE", b);
  b = new XMLHttpRequest;
  b.open("POST", "http://localhost:23518/arduino/", !1);
  b.send(String(a));
  Entry.assert(200 == b.status, "arduino is not connected");
  return Number(b.responseText);
};
Blockly.Blocks.arduino_get_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_number_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_number_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_string = function(a, b) {
  a = b.getValue("VALUE", b);
  b = new XMLHttpRequest;
  b.open("POST", "http://localhost:23518/arduino/", !1);
  b.send(String(a));
  Entry.assert(200 == b.status, "arduino is not connected");
  return b.responseText;
};
Blockly.Blocks.arduino_get_sensor_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_arduino_get_sensor_number_0, "A0"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_1, "A1"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_2, "A2"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_3, "A3"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_4, "A4"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_5, "A5"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_sensor_number = function(a, b) {
  return b.getStringField("PORT");
};
Blockly.Blocks.arduino_get_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_port_number = function(a, b) {
  return b.getStringField("PORT");
};
Blockly.Blocks.arduino_get_pwm_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_pwm_port_number = function(a, b) {
  return b.getStringField("PORT");
};
Blockly.Blocks.arduino_get_number_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.arduino_get_number_sensor_value = function(a, b) {
  a = b.getValue("VALUE", b);
  return Entry.hw.getAnalogPortValue(a[1]);
};
Blockly.Blocks.arduino_get_digital_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_get_digital_value_1);
  this.appendValueInput("VALUE").setCheck("Number");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.arduino_get_digital_value = function(a, b) {
  a = b.getNumberValue("VALUE", b);
  return Entry.hw.getDigitalPortValue(a);
};
Blockly.Blocks.arduino_toggle_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_on, "on"], [Lang.Blocks.ARDUINO_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_toggle_led = function(a, b) {
  a = b.getNumberValue("VALUE");
  var c = b.getField("OPERATOR");
  Entry.hw.setDigitalPortValue(a, "on" == c ? 255 : 0);
  return b.callReturn();
};
Blockly.Blocks.arduino_toggle_pwm = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_1);
  this.appendValueInput("PORT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_3);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_toggle_pwm = function(a, b) {
  a = b.getNumberValue("PORT");
  var c = b.getNumberValue("VALUE"), c = Math.round(c), c = Math.max(c, 0), c = Math.min(c, 255);
  Entry.hw.setDigitalPortValue(a, c);
  return b.callReturn();
};
Blockly.Blocks.arduino_convert_scale = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_4);
  this.appendValueInput("VALUE4").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_5);
  this.appendValueInput("VALUE5").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_6);
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_convert_scale = function(a, b) {
  var c = b.getNumberValue("VALUE1", b), d = b.getNumberValue("VALUE2", b), e = b.getNumberValue("VALUE3", b);
  a = b.getNumberValue("VALUE4", b);
  b = b.getNumberValue("VALUE5", b);
  if (d > e) {
    var f = d, d = e, e = f;
  }
  a > b && (f = a, a = b, b = f);
  c = (b - a) / (e - d) * (c - d);
  c += a;
  c = Math.min(b, c);
  c = Math.max(a, c);
  return Math.round(c);
};
Blockly.Blocks.sensorBoard_get_named_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\uc18c\ub9ac", "0"], ["\ube5b \uac10\uc9c0", "1"], ["\uc2ac\ub77c\uc774\ub354", "2"], ["\uc628\ub3c4", "3"]]), "PORT").appendField(" \uc13c\uc11c\uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.sensorBoard_get_named_sensor_value = function(a, b) {
  return Entry.hw.getAnalogPortValue(b.getField("PORT", b));
};
Blockly.Blocks.sensorBoard_is_button_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\ube68\uac04", "8"], ["\ud30c\ub780", "9"], ["\ub178\ub780", "10"], ["\ucd08\ub85d", "11"]]), "PORT");
  this.appendDummyInput().appendField(" \ubc84\ud2bc\uc744 \ub20c\ub800\ub294\uac00?");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.sensorBoard_is_button_pressed = function(a, b) {
  return Entry.hw.getDigitalPortValue(b.getNumberField("PORT", b));
};
Blockly.Blocks.sensorBoard_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\ube68\uac04", "2"], ["\ucd08\ub85d", "3"], ["\ud30c\ub780", "4"], ["\ud770\uc0c9", "5"]]), "PORT").appendField(" LED").appendField(new Blockly.FieldDropdown([["\ucf1c\uae30", "255"], ["\ub044\uae30", "0"]]), "OPERATOR").appendField(" ").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.sensorBoard_led = function(a, b) {
  Entry.hw.setDigitalPortValue(b.getField("PORT"), b.getNumberField("OPERATOR"));
  return b.callReturn();
};
Entry.block.arduino_download_connector = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \ud504\ub85c\uadf8\ub7a8 \ub2e4\uc6b4\ub85c\ub4dc", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download connector");
}]}};
Entry.block.download_guide = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \uc548\ub0b4 \ub2e4\uc6b4\ub85c\ub4dc", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download guide");
}]}};
Entry.block.arduino_download_source = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5d4\ud2b8\ub9ac \uc544\ub450\uc774\ub178 \uc18c\uc2a4", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Entry.block.arduino_connected = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \ub428", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Entry.block.arduino_reconnect = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\ub2e4\uc2dc \uc5f0\uacb0\ud558\uae30", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Blockly.Blocks.CODEino_get_sensor_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_get_sensor_number_0, "A0"], [Lang.Blocks.CODEino_get_sensor_number_1, "A1"], [Lang.Blocks.CODEino_get_sensor_number_2, "A2"], [Lang.Blocks.CODEino_get_sensor_number_3, "A3"], [Lang.Blocks.CODEino_get_sensor_number_4, "A4"], [Lang.Blocks.CODEino_get_sensor_number_5, "A5"], [Lang.Blocks.CODEino_get_sensor_number_6, "A6"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_sensor_number = function(a, b) {
  return b.getStringField("PORT");
};
Blockly.Blocks.CODEino_get_named_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(" ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_sensor_name_0, "0"], [Lang.Blocks.CODEino_sensor_name_1, "1"], [Lang.Blocks.CODEino_sensor_name_2, "2"], [Lang.Blocks.CODEino_sensor_name_3, "3"], [Lang.Blocks.CODEino_sensor_name_4, "4"], [Lang.Blocks.CODEino_sensor_name_5, "5"], [Lang.Blocks.CODEino_sensor_name_6, "6"]]), "PORT").appendField(Lang.Blocks.CODEino_string_1);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_named_sensor_value = function(a, b) {
  return Entry.hw.getAnalogPortValue(b.getField("PORT", b));
};
Blockly.Blocks.CODEino_get_sound_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_10).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_11, "GREAT"], [Lang.Blocks.CODEino_string_12, "SMALL"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_sound_status = function(a, b) {
  return "GREAT" == b.getField("STATUS", b) ? 600 < Entry.hw.getAnalogPortValue(0) ? 1 : 0 : 600 > Entry.hw.getAnalogPortValue(0) ? 1 : 0;
};
Blockly.Blocks.CODEino_get_light_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_13).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_14, "BRIGHT"], [Lang.Blocks.CODEino_string_15, "DARK"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_light_status = function(a, b) {
  return "DARK" == b.getField("STATUS", b) ? 800 < Entry.hw.getAnalogPortValue(1) ? 1 : 0 : 800 > Entry.hw.getAnalogPortValue(1) ? 1 : 0;
};
Blockly.Blocks.CODEino_is_button_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_3, "4"], [Lang.Blocks.CODEino_string_4, "17"], [Lang.Blocks.CODEino_string_5, "18"], [Lang.Blocks.CODEino_string_6, "19"], [Lang.Blocks.CODEino_string_7, "20"]]), "PORT").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_is_button_pressed = function(a, b) {
  a = b.getNumberField("PORT", b);
  return 14 < a ? !Entry.hw.getAnalogPortValue(a - 14) : !Entry.hw.getDigitalPortValue(a);
};
Blockly.Blocks.CODEino_get_accelerometer_direction = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_8).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_16, "LEFT"], [Lang.Blocks.CODEino_string_17, "RIGHT"], [Lang.Blocks.CODEino_string_18, "FRONT"], [Lang.Blocks.CODEino_string_19, "REAR"], [Lang.Blocks.CODEino_string_20, "REVERSE"]]), "DIRECTION");
  this.appendDummyInput().appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_accelerometer_direction = function(a, b) {
  a = b.getField("DIRECTION", b);
  b = 0;
  "LEFT" == a || "RIGHT" == a ? b = 3 : "FRONT" == a || "REAR" == a ? b = 4 : "REVERSE" == a && (b = 5);
  b = Entry.hw.getAnalogPortValue(b) - 265;
  b = Math.min(90, 180 / 137 * b + -90);
  b = Math.max(-90, b);
  b = Math.round(b);
  if ("LEFT" == a || "REAR" == a) {
    return -30 > b ? 1 : 0;
  }
  if ("RIGHT" == a || "FRONT" == a) {
    return 30 < b ? 1 : 0;
  }
  if ("REVERSE" == a) {
    return -50 > b ? 1 : 0;
  }
};
Blockly.Blocks.CODEino_get_accelerometer_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_8).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_accelerometer_X, "3"], [Lang.Blocks.CODEino_accelerometer_Y, "4"], [Lang.Blocks.CODEino_accelerometer_Z, "5"]]), "PORT").appendField(Lang.Blocks.CODEino_string_9);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_accelerometer_value = function(a, b) {
  var c = Entry.hw.getAnalogPortValue(b.getField("PORT", b)), d = 265, e = 402;
  a = -90;
  b = 90;
  if (d > e) {
    var f = d, d = e, e = f;
  }
  a > b && (f = a, a = b, b = f);
  c = (b - a) / (e - d) * (c - d);
  c += a;
  c = Math.min(b, c);
  c = Math.max(a, c);
  return Math.round(c);
};
Blockly.Blocks.dplay_select_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "PORT");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_on, "on"], [Lang.Blocks.ARDUINO_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_select_led = function(a, b) {
  var c = b.getField("PORT");
  a = 7;
  "7" == c ? a = 7 : "8" == c ? a = 8 : "9" == c ? a = 9 : "10" == c && (a = 10);
  c = b.getField("OPERATOR");
  Entry.hw.setDigitalPortValue(a, "on" == c ? 255 : 0);
  return b.callReturn();
};
Blockly.Blocks.dplay_get_switch_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ub514\uc9c0\ud138 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["2", "2"], ["4", "4"]]), "PORT");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.dplay_string_5, "ON"], [Lang.Blocks.dplay_string_6, "OFF"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_switch_status = function(a, b) {
  a = b.getField("PORT");
  var c = 2;
  "2" == a ? c = 2 : "4" == a && (c = 4);
  return "OFF" == b.getField("STATUS") ? 1 == Entry.hw.getDigitalPortValue(c) ? 1 : 0 : 0 == Entry.hw.getDigitalPortValue(c) ? 1 : 0;
};
Blockly.Blocks.dplay_get_light_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_light).appendField(new Blockly.FieldDropdown([[Lang.Blocks.dplay_string_3, "BRIGHT"], [Lang.Blocks.dplay_string_4, "DARK"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_light_status = function(a, b) {
  return "DARK" == b.getField("STATUS", b) ? 800 < Entry.hw.getAnalogPortValue(1) ? 1 : 0 : 800 > Entry.hw.getAnalogPortValue(1) ? 1 : 0;
};
Blockly.Blocks.dplay_get_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\ubc88 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uac00\ubcc0\uc800\ud56d", "ADJU"], ["\ube5b\uc13c\uc11c", "LIGHT"], ["\uc628\ub3c4\uc13c\uc11c", "TEMP"], ["\uc870\uc774\uc2a4\ud2f1 X", "JOYS"], ["\uc870\uc774\uc2a4\ud2f1 Y", "JOYS"], ["\uc801\uc678\uc120", "INFR"]]), "OPERATOR");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_5);
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.dplay_get_value = function(a, b) {
  a = b.getValue("VALUE", b);
  return Entry.hw.getAnalogPortValue(a[1]);
};
Blockly.Blocks.dplay_get_tilt = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_tilt).appendField(new Blockly.FieldDropdown([["\uc67c\ucabd \uae30\uc6b8\uc784", "LEFT"], ["\uc624\ub978\ucabd \uae30\uc6b8\uc784", "LIGHT"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_tilt = function(a, b) {
  return "LIGHT" == b.getField("STATUS", b) ? 1 == Entry.hw.getDigitalPortValue(12) ? 1 : 0 : 0 == Entry.hw.getDigitalPortValue(12) ? 1 : 0;
};
Blockly.Blocks.dplay_DCmotor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uc67c\ucabd", "3"], ["\uc624\ub978\ucabd", "6"]]), "PORT");
  this.appendDummyInput().appendField(" DC\ubaa8\ud130 \uc0c1\ud0dc\ub97c");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uc815\ubc29\ud5a5", "FRONT"], ["\uc5ed\ubc29\ud5a5", "REAR"], ["\uc815\uc9c0", "OFF"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_DCmotor = function(a, b) {
  a = b.getField("PORT");
  var c = 0;
  "3" == a ? c = 5 : "6" == a && (c = 11);
  var d = b.getField("OPERATOR"), e = 0, f = 0;
  "FRONT" == d ? (e = 255, f = 0) : "REAR" == d ? (e = 0, f = 255) : "OFF" == d && (f = e = 0);
  Entry.hw.setDigitalPortValue(a, e);
  Entry.hw.setDigitalPortValue(c, f);
  return b.callReturn();
};
Blockly.Blocks.dplay_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubd80\uc800\ub97c ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\ub3c4", "1"], ["\ub808", "2"], ["\ubbf8", "3"]]), "PORT");
  this.appendDummyInput().appendField("\ub85c");
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\ubc15\uc790\ub85c \uc5f0\uc8fc\ud558\uae30");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_buzzer = function(a, b) {
  var c = b.getField("PORT");
  a = 2;
  "1" == c ? a = 2 : "2" == c ? a = 4 : "3" == c && (a = 7);
  c = b.getNumberValue("VALUE");
  c = Math.round(c);
  c = Math.max(c, 0);
  c = Math.min(c, 100);
  Entry.hw.setDigitalPortValue(a, c);
  return b.callReturn();
};
Blockly.Blocks.dplay_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc11c\ubcf4\ubaa8\ud130 \uac01\ub3c4\ub97c");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub85c \uc774\ub3d9");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_servo = function(a, b) {
  a = b.getNumberValue("VALUE");
  a = Math.round(a);
  a = Math.max(a, 0);
  a = Math.min(a, 180);
  Entry.hw.setDigitalPortValue(9, a);
  return b.callReturn();
};
Entry.Bitbrick = {SENSOR_MAP:{1:"light", 2:"IR", 3:"touch", 4:"potentiometer", 5:"MIC", 21:"UserSensor", 11:"UserInput", 20:"LED", 19:"SERVO", 18:"DC"}, PORT_MAP:{buzzer:2, 5:4, 6:6, 7:8, 8:10, LEDR:12, LEDG:14, LEDB:16}, sensorList:function() {
  for (var a = [], b = Entry.hw.portData, c = 1;5 > c;c++) {
    var d = b[c];
    d && (d.value || 0 === d.value) && a.push([c + " - " + Lang.Blocks["BITBRICK_" + d.type], c.toString()]);
  }
  return 0 == a.length ? [[Lang.Blocks.no_target, "null"]] : a;
}, touchList:function() {
  for (var a = [], b = Entry.hw.portData, c = 1;5 > c;c++) {
    var d = b[c];
    d && "touch" === d.type && a.push([c.toString(), c.toString()]);
  }
  return 0 == a.length ? [[Lang.Blocks.no_target, "null"]] : a;
}, servoList:function() {
  for (var a = [], b = Entry.hw.portData, c = 5;9 > c;c++) {
    var d = b[c];
    d && "SERVO" === d.type && a.push(["ABCD"[c - 5], c.toString()]);
  }
  return 0 == a.length ? [[Lang.Blocks.no_target, "null"]] : a;
}, dcList:function() {
  for (var a = [], b = Entry.hw.portData, c = 5;9 > c;c++) {
    var d = b[c];
    d && "DC" === d.type && a.push(["ABCD"[c - 5], c.toString()]);
  }
  return 0 == a.length ? [[Lang.Blocks.no_target, "null"]] : a;
}, setZero:function() {
  var a = Entry.hw.sendQueue, b;
  for (b in Entry.Bitbrick.PORT_MAP) {
    a[b] = 0;
  }
  Entry.hw.update();
}, name:"bitbrick", servoMaxValue:181, servoMinValue:1, dcMaxValue:100, dcMinValue:-100, monitorTemplate:{keys:["value"], imgPath:"hw/bitbrick.png", width:400, height:400, listPorts:{1:{name:Lang.Hw.port_en + " 1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, 
y:0}}, A:{name:Lang.Hw.port_en + " A " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, B:{name:Lang.Hw.port_en + " B " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, C:{name:Lang.Hw.port_en + " C " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, D:{name:Lang.Hw.port_en + " D " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Blockly.Blocks.bitbrick_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.sensorList), "PORT").appendField(" \uac12");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_sensor_value = function(a, b) {
  a = b.getStringField("PORT");
  return Entry.hw.portData[a].value;
};
Blockly.Blocks.bitbrick_is_touch_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.BITBRICK_touch).appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.touchList), "PORT").appendField("\uc774(\uac00) \ub20c\ub838\ub294\uac00?");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_is_touch_pressed = function(a, b) {
  return 0 === Entry.hw.portData[b.getStringField("PORT")].value;
};
Blockly.Blocks.bitbrick_turn_off_color_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_off_color_led = function(a, b) {
  Entry.hw.sendQueue.LEDR = 0;
  Entry.hw.sendQueue.LEDG = 0;
  Entry.hw.sendQueue.LEDB = 0;
  return b.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ucf1c\uae30 R");
  this.appendValueInput("rValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("G");
  this.appendValueInput("gValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("B");
  this.appendValueInput("bValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_rgb = function(a, b) {
  a = b.getNumberValue("rValue");
  var c = b.getNumberValue("gValue"), d = b.getNumberValue("bValue"), e = Entry.adjustValueWithMaxMin, f = Entry.hw.sendQueue;
  f.LEDR = e(a, 0, 255);
  f.LEDG = e(c, 0, 255);
  f.LEDB = e(d, 0, 255);
  return b.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_picker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \uc0c9 ").appendField(new Blockly.FieldColour("#ff0000"), "VALUE").appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_picker = function(a, b) {
  a = b.getStringField("VALUE");
  Entry.hw.sendQueue.LEDR = parseInt(a.substr(1, 2), 16);
  Entry.hw.sendQueue.LEDG = parseInt(a.substr(3, 2), 16);
  Entry.hw.sendQueue.LEDB = parseInt(a.substr(5, 2), 16);
  return b.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ucf1c\uae30 \uc0c9");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_value = function(a, b) {
  a = b.getNumberValue("VALUE");
  var c, d, e;
  a %= 200;
  67 > a ? (c = 200 - 3 * a, d = 3 * a, e = 0) : 134 > a ? (a -= 67, c = 0, d = 200 - 3 * a, e = 3 * a) : 201 > a && (a -= 134, c = 3 * a, d = 0, e = 200 - 3 * a);
  Entry.hw.sendQueue.LEDR = c;
  Entry.hw.sendQueue.LEDG = d;
  Entry.hw.sendQueue.LEDB = e;
  return b.callReturn();
};
Blockly.Blocks.bitbrick_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc84\uc800\uc74c ");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub0b4\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_buzzer = function(a, b) {
  if (b.isStart) {
    return Entry.hw.sendQueue.buzzer = 0, delete b.isStart, b.callReturn();
  }
  a = b.getNumberValue("VALUE");
  Entry.hw.sendQueue.buzzer = a;
  b.isStart = !0;
  return b;
};
Blockly.Blocks.bitbrick_turn_off_all_motors = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubaa8\ub4e0 \ubaa8\ud130 \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_off_all_motors = function(a, b) {
  var c = Entry.hw.sendQueue;
  a = Entry.Bitbrick;
  a.servoList().map(function(b) {
    c[b[1]] = 0;
  });
  a.dcList().map(function(b) {
    c[b[1]] = 128;
  });
  return b.callReturn();
};
Blockly.Blocks.bitbrick_dc_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DC \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.dcList), "PORT").appendField(" \uc18d\ub3c4");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_dc_speed = function(a, b) {
  a = b.getNumberValue("VALUE");
  a = Math.min(a, Entry.Bitbrick.dcMaxValue);
  a = Math.max(a, Entry.Bitbrick.dcMinValue);
  Entry.hw.sendQueue[b.getStringField("PORT")] = a + 128;
  return b.callReturn();
};
Blockly.Blocks.bitbrick_dc_direction_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DC \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.dcList), "PORT").appendField(" ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.BITBRICK_dc_direction_cw, "CW"], [Lang.Blocks.BITBRICK_dc_direction_ccw, "CCW"]]), "DIRECTION").appendField(" \ubc29\ud5a5").appendField(" \uc18d\ub825");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_dc_direction_speed = function(a, b) {
  a = "CW" === b.getStringField("DIRECTION");
  var c = b.getNumberValue("VALUE"), c = Math.min(c, Entry.Bitbrick.dcMaxValue), c = Math.max(c, 0);
  Entry.hw.sendQueue[b.getStringField("PORT")] = a ? c + 128 : 128 - c;
  return b.callReturn();
};
Blockly.Blocks.bitbrick_servomotor_angle = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc11c\ubcf4 \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.servoList), "PORT").appendField(" \uac01\ub3c4");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_servomotor_angle = function(a, b) {
  a = b.getNumberValue("VALUE") + 1;
  a = Math.min(a, Entry.Bitbrick.servoMaxValue);
  a = Math.max(a, Entry.Bitbrick.servoMinValue);
  Entry.hw.sendQueue[b.getStringField("PORT")] = a;
  return b.callReturn();
};
Blockly.Blocks.bitbrick_convert_scale = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubcc0\ud658");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.sensorList), "PORT");
  this.appendDummyInput().appendField("\uac12");
  this.appendValueInput("VALUE2").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\uc5d0\uc11c");
  this.appendValueInput("VALUE4").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_5);
  this.appendValueInput("VALUE5").setCheck(["Number", "String", null]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_convert_scale = function(a, b) {
  a = b.getNumberField("PORT");
  var c = Entry.hw.portData[a].value, d = b.getNumberValue("VALUE2", b), e = b.getNumberValue("VALUE3", b);
  a = b.getNumberValue("VALUE4", b);
  b = b.getNumberValue("VALUE5", b);
  if (a > b) {
    var f = a;
    a = b;
    b = f;
  }
  c = (b - a) / (e - d) * (c - d);
  c += a;
  c = Math.min(b, c);
  c = Math.max(a, c);
  return Math.round(c);
};
Entry.Cobl = {name:"cobl", setZero:function() {
  for (var a = 0;14 > a;a++) {
    Entry.hw.sendQueue[a] = 0;
  }
  Entry.hw.update();
}};
Blockly.Blocks.cobl_read_ultrason = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ucd08\uc74c\ud30c \uac70\ub9ac\uc7ac\uae30(0~400)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_ultrason = function(a, b) {
  return Entry.hw.getAnalogPortValue("ultrason");
};
Blockly.Blocks.cobl_read_potenmeter = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uac00\ubcc0\uc800\ud56d \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_potenmeter = function(a, b) {
  console.log("cobl_read_potenmeter");
  return Entry.hw.getAnalogPortValue("potenmeter");
};
Blockly.Blocks.cobl_read_irread1 = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("IR1 \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_irread1 = function(a, b) {
  return Entry.hw.getAnalogPortValue("potenmeter");
};
Blockly.Blocks.cobl_read_irread2 = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("IR2 \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_irread2 = function(a, b) {
  b.getValue("irread2", b);
  return Entry.hw.getAnalogPortValue("irread2");
};
Blockly.Blocks.cobl_read_joyx = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc870\uc774\uc2a4\ud2f1X\ucd95 \uc77d\uae30(1,0,-1)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_joyx = function(a, b) {
  return Entry.hw.getAnalogPortValue("joyx");
};
Blockly.Blocks.cobl_read_joyy = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc870\uc774\uc2a4\ud2f1Y\ucd95 \uc77d\uae30(1,0,-1)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_joyy = function(a, b) {
  return Entry.hw.getAnalogPortValue("joyy");
};
Blockly.Blocks.cobl_read_sens1 = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc13c\uc11c1 \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_sens1 = function(a, b) {
  return Entry.hw.getAnalogPortValue("sens1");
};
Blockly.Blocks.cobl_read_sens2 = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc13c\uc11c2 \uc77d\uae30(0~1023)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_sens2 = function(a, b) {
  return Entry.hw.getAnalogPortValue("sens2");
};
Blockly.Blocks.cobl_read_tilt = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uae30\uc6b8\uae30\uc13c\uc11c \uc77d\uae30(0~4)");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_tilt = function(a, b) {
  return Entry.hw.getAnalogPortValue("tilt");
};
Blockly.Blocks.cobl_get_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.cobl_get_port_number = function(a, b) {
  return b.getStringField("PORT");
};
Blockly.Blocks.cobl_read_temps = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc628\ub3c4\uc13c\uc11c \uc77d\uae30@\ud3ec\ud2b8");
  this.appendValueInput("VALUE").setCheck("Number");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_temps = function(a, b) {
  a = b.getValue("VALUE", b);
  if (1 == a) {
    return Entry.hw.getAnalogPortValue("temps1");
  }
  if (2 == a) {
    return Entry.hw.getAnalogPortValue("temps2");
  }
};
Blockly.Blocks.cobl_read_light = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc1d\uae30\uc13c\uc11c \uc77d\uae30@\ud3ec\ud2b8");
  this.appendValueInput("VALUE").setCheck("Number");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.cobl_read_light = function(a, b) {
  a = b.getValue("VALUE", b);
  if (1 == a) {
    return Entry.hw.getAnalogPortValue("light1");
  }
  if (2 == a) {
    return Entry.hw.getAnalogPortValue("light2");
  }
};
Blockly.Blocks.cobl_read_btn = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc84\ud2bc\uc13c\uc11c \uc77d\uae30@\ud3ec\ud2b8");
  this.appendValueInput("VALUE").setCheck("Number");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.cobl_read_btn = function(a, b) {
  a = b.getValue("VALUE", b);
  if (1 == a) {
    return Entry.hw.getDigitalPortValue("btn1");
  }
  if (2 == a) {
    return Entry.hw.getDigitalPortValue("btn2");
  }
};
Blockly.Blocks.cobl_led_control = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("Rainbow LED");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OFF", "OFF"], ["Red", "Red"], ["Orange", "Orange"], ["Yellow", "Yellow"], ["Green", "Green"], ["Blue", "Blue"], ["Dark Blue", "Dark Blue"], ["Purple", "Purple"], ["White", "White"]]), "OPERATOR");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_led_control = function(a, b) {
  a = b.getStringField("PORT");
  var c = b.getStringField("OPERATOR");
  Entry.hw.setDigitalPortValue("RainBowLED_IDX", a);
  Entry.hw.setDigitalPortValue("RainBowLED_COL", c);
  return b.callReturn();
};
Blockly.Blocks.cobl_text = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput("cobl"), "NAME");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.cobl_text = function(a, b) {
  return b.getStringField("NAME");
};
Blockly.Blocks.cobl_servo_angle_control = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("Servo");
  this.appendValueInput("PORT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("Angle-");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("(15~165)");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_servo_angle_control = function(a, b) {
  console.log("servo - test");
  a = b.getNumberValue("PORT");
  var c = b.getNumberValue("VALUE"), c = Math.round(c), c = Math.max(c, 15), c = Math.min(c, 165);
  1 == a && (console.log("servo 1  degree " + c), Entry.hw.setDigitalPortValue("Servo1", c));
  2 == a && (console.log("servo 2 degree " + c), Entry.hw.setDigitalPortValue("Servo2", c));
  return b.callReturn();
};
Blockly.Blocks.cobl_melody = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("Melody");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["(Low)So", "L_So"], ["(Low)So#", "L_So#"], ["(Low)La", "L_La"], ["(Low)La#", "L_La#"], ["(Low)Ti", "L_Ti"], ["Do", "Do"], ["Do#", "Do#"], ["Re", "Re"], ["Re#", "Re#"], ["Mi", "Mi"], ["Fa", "Fa"], ["Fa#", "Fa#"], ["So", "So"], ["So#", "So#"], ["La", "La"], ["La#", "La#"], ["Ti", "Ti"], ["(High)Do", "H_Do"], ["(High)Do#", "H_Do#"], ["(High)Re", "H_Re"], ["(High)R2#", "H_Re#"], ["(High)Mi", "H_Mi"], ["(High)Fa", "H_Fa"]]), "MELODY");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_melody = function(a, b) {
  a = b.getStringField("MELODY");
  console.log("cobl_melody" + a);
  Entry.hw.setDigitalPortValue("Melody", a);
  return b.callReturn();
};
Blockly.Blocks.cobl_dcmotor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DcMotor");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "MOTOR");
  this.appendDummyInput().appendField(" ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1.Clockwise", "1"], ["2.Counter Clockwise", "2"], ["3.Stop", "3"]]), "DIRECTION");
  this.appendDummyInput().appendField(" Speed");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]]), "SPEED");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_dcmotor = function(a, b) {
  a = b.getStringField("MOTOR");
  var c = b.getStringField("DIRECTION"), d = b.getStringField("SPEED");
  console.log("MOTOR" + a + "  Direction" + c + "  speed" + d);
  1 == a && (Entry.hw.setDigitalPortValue("DC1_DIR", c), Entry.hw.setDigitalPortValue("DC1_SPEED", d));
  2 == a && (Entry.hw.setDigitalPortValue("DC2_DIR", c), Entry.hw.setDigitalPortValue("DC2_SPEED", d));
  return b.callReturn();
};
Blockly.Blocks.cobl_extention_port = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("Extention Port");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "PORT");
  this.appendDummyInput().appendField(" Level");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]]), "LEVEL");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_extention_port = function(a, b) {
  a = b.getStringField("PORT");
  var c = b.getStringField("LEVEL");
  1 == a && Entry.hw.setDigitalPortValue("EXUSB1", c);
  2 == a && Entry.hw.setDigitalPortValue("EXUSB2", c);
  return b.callReturn();
};
Blockly.Blocks.cobl_external_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("External LED ");
  this.appendValueInput("LED").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(" (1~64)");
  this.appendDummyInput().appendField(" R ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "RED");
  this.appendDummyInput().appendField(" G ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "GREEN");
  this.appendDummyInput().appendField(" B ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "BLUE");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_external_led = function(a, b) {
  a = b.getNumberValue("LED");
  var c = b.getStringField("RED"), d = b.getStringField("GREEN"), e = b.getStringField("BLUE");
  Entry.hw.setDigitalPortValue("ELED_IDX", a);
  Entry.hw.setDigitalPortValue("ELED_R", c);
  Entry.hw.setDigitalPortValue("ELED_G", d);
  Entry.hw.setDigitalPortValue("ELED_B", e);
  return b.callReturn();
};
Blockly.Blocks.cobl_7_segment = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("7 Segment");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("(0~9999)");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.cobl_7_segment = function(a, b) {
  a = b.getNumberValue("VALUE");
  Entry.hw.setDigitalPortValue("7SEG", a);
  return b.callReturn();
};
Entry.Codestar = {name:"codestar", setZero:function() {
  Entry.hw.sendQueue.readablePorts = [];
  for (var a = 0;20 > a;a++) {
    Entry.hw.sendQueue[a] = 0, Entry.hw.sendQueue.readablePorts.push(a);
  }
  Entry.hw.update();
}, monitorTemplate:{imgPath:"hw/codestar.png", width:333, height:409, listPorts:{13:{name:"\uc9c4\ub3d9\ubaa8\ud130", type:"output", pos:{x:0, y:0}}, 6:{name:"\uc9c4\ub3d9\uc13c\uc11c", type:"input", pos:{x:0, y:0}}}, ports:{7:{name:"\ube68\uac04\uc0c9", type:"output", pos:{x:238, y:108}}, 8:{name:"\ud30c\ub780\uc0c9", type:"output", pos:{x:265, y:126}}, 9:{name:"3\uc0c9 \ube68\uac04\uc0c9", type:"output", pos:{x:292, y:34}}, 10:{name:"3\uc0c9 \ub179\uc0c9", type:"output", pos:{x:292, y:34}}, 11:{name:"3\uc0c9 \ud30c\ub780\uc0c9", 
type:"output", pos:{x:292, y:34}}, 12:{name:"\ubc84\ud2bc", type:"input", pos:{x:248, y:142}}, a0:{name:"\uc67c\ucabd \ubcbd\uac10\uc9c0", type:"input", pos:{x:24, y:231}}, a2:{name:"\ub9c8\uc774\ud06c", type:"input", pos:{x:225, y:67}}, a3:{name:"\ubd80\uc800", type:"output", pos:{x:283, y:105}}, a4:{name:"\uc67c\ucabd \ub77c\uc778\uac10\uc9c0", type:"input", pos:{x:37, y:353}}, a5:{name:"\uc624\ub978\ucabd \ub77c\uc778\uac10\uc9c0", type:"input", pos:{x:50, y:368}}, a6:{name:"\uc870\ub3c4\uc13c\uc11c", 
type:"input", pos:{x:273, y:22}}, a7:{name:"\uc624\ub978\ucabd \ubcbd\uac10\uc9c0", type:"input", pos:{x:103, y:381}}, temperature:{name:"\uc628\ub3c4\uc13c\uc11c", type:"input", pos:{x:311, y:238}}, sonar:{name:"\ucd08\uc74c\ud30c", type:"input", pos:{x:7, y:277}}, leftwheel:{name:"\uc67c\ucabd \ubc14\ud034", type:"output", pos:{x:177, y:370}}, rightwheel:{name:"\uc624\ub978\ucabd \ubc14\ud034", type:"output", pos:{x:83, y:218}}}, mode:"both"}};
Entry.EV3 = {PORT_MAP:{A:0, B:0, C:0, D:0, 1:void 0, 2:void 0, 3:void 0, 4:void 0}, motorMovementTypes:{Degrees:0, Power:1}, deviceTypes:{NxtTouch:1, NxtLight:2, NxtSound:3, NxtColor:4, NxtUltrasonic:5, NxtTemperature:6, LMotor:7, MMotor:8, Touch:16, Color:29, Ultrasonic:30, Gyroscope:32, Infrared:33, Initializing:125, Empty:126, WrongPort:127, Unknown:255}, colorSensorValue:" 000000 0000FF 00FF00 FFFF00 FF0000 FFFFFF A52A2A".split(" "), timeouts:[], removeTimeout:function(a) {
  clearTimeout(a);
  var b = this.timeouts;
  a = b.indexOf(a);
  0 <= a && b.splice(a, 1);
}, removeAllTimeouts:function() {
  var a = this.timeouts, b;
  for (b in a) {
    clearTimeout(a[b]);
  }
  this.timeouts = [];
}, setZero:function() {
  var a = this.PORT_MAP;
  Object.keys(a).forEach(function(b) {
    /[A-D]/i.test(b) ? Entry.hw.sendQueue[b] = {type:Entry.EV3.motorMovementTypes.Power, power:0} : Entry.hw.sendQueue[b] = a[b];
  });
  Entry.hw.update();
}, name:"EV3"};
Blockly.Blocks.ev3_get_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]]), "PORT").appendField("\uc758 \uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.ev3_get_sensor_value = function(a, b) {
  b.getStringField("PORT", b);
  a = Entry.hw.getDigitalPortValue(b.getNumberField("PORT", b));
  var c;
  $.isPlainObject(a) && (c = a.siValue || 0);
  return c;
};
Blockly.Blocks.ev3_touch_sensor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]]), "PORT").appendField("\uc758 \ud130\uce58\uc13c\uc11c\uac00 \uc791\ub3d9\ub418\uc5c8\ub294\uac00?");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.ev3_touch_sensor = function(a, b) {
  b.getStringField("PORT", b);
  a = Entry.hw.getDigitalPortValue(b.getNumberField("PORT", b));
  b = !1;
  a.type == Entry.EV3.deviceTypes.Touch && 1 <= Number(a.siValue) && (b = !0);
  return b;
};
Blockly.Blocks.ev3_color_sensor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]]), "PORT").appendField("\uc758 ").appendField(new Blockly.FieldDropdown([["RGB", "RGB"], ["R", "R"], ["G", "G"], ["B", "B"]]), "RGB").appendField("\uac12");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.ev3_color_sensor = function(a, b) {
  b.getStringField("PORT", b);
  a = b.getStringField("RGB", b);
  b = Entry.hw.getDigitalPortValue(b.getNumberField("PORT", b));
  var c = "";
  if (b.type == Entry.EV3.deviceTypes.Color) {
    if (0 == b.siValue) {
      c = "";
    } else {
      switch(a) {
        case "RGB":
          c = Entry.EV3.colorSensorValue[b.siValue];
          break;
        case "R":
          c = Entry.EV3.colorSensorValue[b.siValue].substring(0, 2);
          break;
        case "G":
          c = Entry.EV3.colorSensorValue[b.siValue].substring(2, 4);
          break;
        case "B":
          c = Entry.EV3.colorSensorValue[b.siValue].substring(4, 6);
      }
    }
  } else {
    c = "\uceec\ub7ec \uc13c\uc11c \uc544\ub2d8";
  }
  return c;
};
Blockly.Blocks.ev3_motor_power = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]), "PORT").appendField("\uc758 \uac12\uc744");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\uc73c\ub85c \ucd9c\ub825");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.ev3_motor_power = function(a, b) {
  a = b.getStringField("PORT", b);
  var c = b.getValue("VALUE", b);
  Entry.hw.sendQueue[a] = {id:Math.floor(1E5 * Math.random(), 0), type:Entry.EV3.motorMovementTypes.Power, power:c};
  return b.callReturn();
};
Blockly.Blocks.ev3_motor_power_on_time = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]), "PORT").appendField("\uc758 \uac12\uc744");
  this.appendValueInput("TIME").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ucd08 \ub3d9\uc548");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\uc73c\ub85c \ucd9c\ub825");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.ev3_motor_power_on_time = function(a, b) {
  a = b.getStringField("PORT", b);
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    Entry.hw.sendQueue[a] = {id:Math.floor(1E5 * Math.random(), 0), type:Entry.EV3.motorMovementTypes.Power, power:0};
    return b.callReturn();
  }
  var c = b.getValue("TIME", b), d = b.getValue("VALUE", b);
  b.isStart = !0;
  b.timeFlag = 1;
  Entry.hw.sendQueue[a] = {id:Math.floor(1E5 * Math.random(), 0), type:Entry.EV3.motorMovementTypes.Power, power:d};
  var e = setTimeout(function() {
    b.timeFlag = 0;
    Entry.EV3.removeTimeout(e);
  }, 1E3 * c);
  Entry.EV3.timeouts.push(e);
  return b;
};
Blockly.Blocks.ev3_motor_degrees = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]), "PORT").appendField("\uc758 \uac12\uc744").appendField(new Blockly.FieldDropdown([["\uc2dc\uacc4\ubc29\ud5a5", "CW"], ["\ubc18\uc2dc\uacc4\ubc29\ud5a5", "CCW"]]), "DIRECTION").appendField("\uc73c\ub85c ");
  this.appendValueInput("DEGREE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ub3c4 \ub9cc\ud07c \ud68c\uc804");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.ev3_motor_degrees = function(a, b) {
  a = b.getStringField("PORT", b);
  var c = b.getValue("DEGREE", b);
  0 >= c ? c = 0 : 720 <= c && (c = 720);
  var d = b.getStringField("DIRECTION", b);
  Entry.hw.sendQueue[a] = {id:Math.floor(1E5 * Math.random(), 0), type:Entry.EV3.motorMovementTypes.Degrees, degree:c, power:"CW" == d ? 50 : -50};
  return b.callReturn();
};
Entry.Hamster = {PORT_MAP:{leftWheel:0, rightWheel:0, buzzer:0, outputA:0, outputB:0, leftLed:0, rightLed:0, note:0, lineTracerMode:0, lineTracerModeId:0, lineTracerSpeed:5, ioModeA:0, ioModeB:0}, setZero:function() {
  var a = Entry.Hamster.PORT_MAP, b = Entry.hw.sendQueue, c;
  for (c in a) {
    b[c] = a[c];
  }
  Entry.hw.update();
  a = Entry.Hamster;
  a.lineTracerModeId = 0;
  a.lineTracerStateId = -1;
  a.tempo = 60;
  a.removeAllTimeouts();
}, lineTracerModeId:0, lineTracerStateId:-1, tempo:60, timeouts:[], removeTimeout:function(a) {
  clearTimeout(a);
  var b = this.timeouts;
  a = b.indexOf(a);
  0 <= a && b.splice(a, 1);
}, removeAllTimeouts:function() {
  var a = this.timeouts, b;
  for (b in a) {
    clearTimeout(a[b]);
  }
  this.timeouts = [];
}, setLineTracerMode:function(a, b) {
  this.lineTracerModeId = this.lineTracerModeId + 1 & 255;
  a.lineTracerMode = b;
  a.lineTracerModeId = this.lineTracerModeId;
}, name:"hamster", monitorTemplate:{imgPath:"hw/hamster.png", width:256, height:256, listPorts:{temperature:{name:Lang.Blocks.HAMSTER_sensor_temperature, type:"input", pos:{x:0, y:0}}, inputA:{name:Lang.Blocks.HAMSTER_sensor_input_a, type:"input", pos:{x:0, y:0}}, inputB:{name:Lang.Blocks.HAMSTER_sensor_input_b, type:"input", pos:{x:0, y:0}}, accelerationX:{name:Lang.Blocks.HAMSTER_sensor_acceleration_x, type:"input", pos:{x:0, y:0}}, accelerationY:{name:Lang.Blocks.HAMSTER_sensor_acceleration_y, 
type:"input", pos:{x:0, y:0}}, accelerationZ:{name:Lang.Blocks.HAMSTER_sensor_acceleration_z, type:"input", pos:{x:0, y:0}}, buzzer:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, note:{name:Lang.Hw.note, type:"output", pos:{x:0, y:0}}, outputA:{name:Lang.Hw.output + "A", type:"output", pos:{x:0, y:0}}, outputB:{name:Lang.Hw.output + "B", type:"output", pos:{x:0, y:0}}}, ports:{leftProximity:{name:Lang.Blocks.HAMSTER_sensor_left_proximity, type:"input", pos:{x:122, y:156}}, rightProximity:{name:Lang.Blocks.HAMSTER_sensor_right_proximity, 
type:"input", pos:{x:10, y:108}}, leftFloor:{name:Lang.Blocks.HAMSTER_sensor_left_floor, type:"input", pos:{x:100, y:234}}, rightFloor:{name:Lang.Blocks.HAMSTER_sensor_right_floor, type:"input", pos:{x:13, y:180}}, light:{name:Lang.Blocks.HAMSTER_sensor_light, type:"input", pos:{x:56, y:189}}, leftWheel:{name:Lang.Hw.leftWheel, type:"output", pos:{x:209, y:115}}, rightWheel:{name:Lang.Hw.rightWheel, type:"output", pos:{x:98, y:30}}, leftLed:{name:Lang.Hw.left + " " + Lang.Hw.led_en, type:"output", 
pos:{x:87, y:210}}, rightLed:{name:Lang.Hw.right + " " + Lang.Hw.led_en, type:"output", pos:{x:24, y:168}}}, mode:"both"}};
Blockly.Blocks.hamster_hand_found = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_hand_found);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.hamster_hand_found = function(a, b) {
  a = Entry.hw.portData;
  return 50 < a.leftProximity || 50 < a.rightProximity;
};
Blockly.Blocks.hamster_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_sensor_left_proximity, "leftProximity"], [Lang.Blocks.HAMSTER_sensor_right_proximity, "rightProximity"], [Lang.Blocks.HAMSTER_sensor_left_floor, "leftFloor"], [Lang.Blocks.HAMSTER_sensor_right_floor, "rightFloor"], [Lang.Blocks.HAMSTER_sensor_acceleration_x, "accelerationX"], [Lang.Blocks.HAMSTER_sensor_acceleration_y, "accelerationY"], [Lang.Blocks.HAMSTER_sensor_acceleration_z, "accelerationZ"], 
  [Lang.Blocks.HAMSTER_sensor_light, "light"], [Lang.Blocks.HAMSTER_sensor_temperature, "temperature"], [Lang.Blocks.HAMSTER_sensor_signal_strength, "signalStrength"], [Lang.Blocks.HAMSTER_sensor_input_a, "inputA"], [Lang.Blocks.HAMSTER_sensor_input_b, "inputB"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.hamster_value = function(a, b) {
  a = Entry.hw.portData;
  b = b.getField("DEVICE");
  return a[b];
};
Blockly.Blocks.hamster_move_forward_once = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_once).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_forward_once = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = Entry.hw.portData;
  if (b.isStart) {
    if (b.isMoving) {
      switch(b.boardState) {
        case 1:
          2 > b.count ? (50 > c.leftFloor && 50 > c.rightFloor ? b.count++ : b.count = 0, c = c.leftFloor - c.rightFloor, a.leftWheel = 45 + .25 * c, a.rightWheel = 45 - .25 * c) : (b.count = 0, b.boardState = 2);
          break;
        case 2:
          c = c.leftFloor - c.rightFloor;
          a.leftWheel = 45 + .25 * c;
          a.rightWheel = 45 - .25 * c;
          b.boardState = 3;
          var d = setTimeout(function() {
            b.boardState = 4;
            Entry.Hamster.removeTimeout(d);
          }, 250);
          Entry.Hamster.timeouts.push(d);
          break;
        case 3:
          c = c.leftFloor - c.rightFloor;
          a.leftWheel = 45 + .25 * c;
          a.rightWheel = 45 - .25 * c;
          break;
        case 4:
          a.leftWheel = 0, a.rightWheel = 0, b.boardState = 0, b.isMoving = !1;
      }
      return b;
    }
    delete b.isStart;
    delete b.isMoving;
    delete b.count;
    delete b.boardState;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.isMoving = !0;
  b.count = 0;
  b.boardState = 1;
  a.leftWheel = 45;
  a.rightWheel = 45;
  Entry.Hamster.setLineTracerMode(a, 0);
  return b;
};
Blockly.Blocks.hamster_turn_once = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_once_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_turn_once_left, "LEFT"], [Lang.Blocks.HAMSTER_turn_once_right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_once_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_turn_once = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = Entry.hw.portData;
  if (b.isStart) {
    if (b.isMoving) {
      if (b.isLeft) {
        switch(b.boardState) {
          case 1:
            2 > b.count ? 50 < c.leftFloor && b.count++ : (b.count = 0, b.boardState = 2);
            break;
          case 2:
            20 > c.leftFloor && (b.boardState = 3);
            break;
          case 3:
            2 > b.count ? 20 > c.leftFloor && b.count++ : (b.count = 0, b.boardState = 4);
            break;
          case 4:
            50 < c.leftFloor && (b.boardState = 5);
            break;
          case 5:
            c = c.leftFloor - c.rightFloor, -15 < c ? (a.leftWheel = 0, a.rightWheel = 0, b.boardState = 0, b.isMoving = !1) : (a.leftWheel = .5 * c, a.rightWheel = .5 * -c);
        }
      } else {
        switch(b.boardState) {
          case 1:
            2 > b.count ? 50 < c.rightFloor && b.count++ : (b.count = 0, b.boardState = 2);
            break;
          case 2:
            20 > c.rightFloor && (b.boardState = 3);
            break;
          case 3:
            2 > b.count ? 20 > c.rightFloor && b.count++ : (b.count = 0, b.boardState = 4);
            break;
          case 4:
            50 < c.rightFloor && (b.boardState = 5);
            break;
          case 5:
            c = c.rightFloor - c.leftFloor, -15 < c ? (a.leftWheel = 0, a.rightWheel = 0, b.boardState = 0, b.isMoving = !1) : (a.leftWheel = .5 * -c, a.rightWheel = .5 * c);
        }
      }
      return b;
    }
    delete b.isStart;
    delete b.isMoving;
    delete b.count;
    delete b.boardState;
    delete b.isLeft;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.isMoving = !0;
  b.count = 0;
  b.boardState = 1;
  "LEFT" == b.getField("DIRECTION", b) ? (b.isLeft = !0, a.leftWheel = -45, a.rightWheel = 45) : (b.isLeft = !1, a.leftWheel = 45, a.rightWheel = -45);
  Entry.Hamster.setLineTracerMode(a, 0);
  return b;
};
Blockly.Blocks.hamster_move_forward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_forward_for_secs = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  a.leftWheel = 30;
  a.rightWheel = 30;
  Entry.Hamster.setLineTracerMode(a, 0);
  a = 1E3 * b.getNumberValue("VALUE");
  var c = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Hamster.removeTimeout(c);
  }, a);
  Entry.Hamster.timeouts.push(c);
  return b;
};
Blockly.Blocks.hamster_move_backward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_backward_for_secs = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  a.leftWheel = -30;
  a.rightWheel = -30;
  Entry.Hamster.setLineTracerMode(a, 0);
  a = 1E3 * b.getNumberValue("VALUE");
  var c = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Hamster.removeTimeout(c);
  }, a);
  Entry.Hamster.timeouts.push(c);
  return b;
};
Blockly.Blocks.hamster_turn_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_for_secs_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_turn_left, "LEFT"], [Lang.Blocks.HAMSTER_turn_right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_for_secs_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_for_secs_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_turn_for_secs = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.leftWheel = 0;
    a.rightWheel = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  "LEFT" == b.getField("DIRECTION", b) ? (a.leftWheel = -30, a.rightWheel = 30) : (a.leftWheel = 30, a.rightWheel = -30);
  Entry.Hamster.setLineTracerMode(a, 0);
  a = 1E3 * b.getNumberValue("VALUE");
  var c = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Hamster.removeTimeout(c);
  }, a);
  Entry.Hamster.timeouts.push(c);
  return b;
};
Blockly.Blocks.hamster_change_both_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_both_wheels_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getNumberValue("LEFT"), d = b.getNumberValue("RIGHT");
  a.leftWheel = void 0 != a.leftWheel ? a.leftWheel + c : c;
  a.rightWheel = void 0 != a.rightWheel ? a.rightWheel + d : d;
  Entry.Hamster.setLineTracerMode(a, 0);
  return b.callReturn();
};
Blockly.Blocks.hamster_set_both_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_both_wheels_to = function(a, b) {
  a = Entry.hw.sendQueue;
  a.leftWheel = b.getNumberValue("LEFT");
  a.rightWheel = b.getNumberValue("RIGHT");
  Entry.Hamster.setLineTracerMode(a, 0);
  return b.callReturn();
};
Blockly.Blocks.hamster_change_wheel_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheel_by_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_wheel, "LEFT"], [Lang.Blocks.HAMSTER_right_wheel, "RIGHT"], [Lang.Blocks.HAMSTER_both_wheels, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_change_wheel_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheel_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_wheel_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getField("DIRECTION"), d = b.getNumberValue("VALUE");
  "LEFT" == c ? a.leftWheel = void 0 != a.leftWheel ? a.leftWheel + d : d : ("RIGHT" != c && (a.leftWheel = void 0 != a.leftWheel ? a.leftWheel + d : d), a.rightWheel = void 0 != a.rightWheel ? a.rightWheel + d : d);
  Entry.Hamster.setLineTracerMode(a, 0);
  return b.callReturn();
};
Blockly.Blocks.hamster_set_wheel_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheel_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_wheel, "LEFT"], [Lang.Blocks.HAMSTER_right_wheel, "RIGHT"], [Lang.Blocks.HAMSTER_both_wheels, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_wheel_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheel_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_wheel_to = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getField("DIRECTION"), d = b.getNumberValue("VALUE");
  "LEFT" == c ? a.leftWheel = d : ("RIGHT" != c && (a.leftWheel = d), a.rightWheel = d);
  Entry.Hamster.setLineTracerMode(a, 0);
  return b.callReturn();
};
Blockly.Blocks.hamster_follow_line_using = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_follow_line_using_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_color_black, "BLACK"], [Lang.Blocks.HAMSTER_color_white, "WHITE"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_follow_line_using_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_floor_sensor, "LEFT"], [Lang.Blocks.HAMSTER_right_floor_sensor, "RIGHT"], [Lang.Blocks.HAMSTER_both_floor_sensors, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_follow_line_using_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_follow_line_using = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getField("COLOR"), d = b.getField("DIRECTION"), e = 1;
  "RIGHT" == d ? e = 2 : "BOTH" == d && (e = 3);
  "WHITE" == c && (e += 7);
  a.leftWheel = 0;
  a.rightWheel = 0;
  Entry.Hamster.setLineTracerMode(a, e);
  return b.callReturn();
};
Blockly.Blocks.hamster_follow_line_until = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_follow_line_until_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_color_black, "BLACK"], [Lang.Blocks.HAMSTER_color_white, "WHITE"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_follow_line_until_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_intersection, "LEFT"], [Lang.Blocks.HAMSTER_right_intersection, "RIGHT"], [Lang.Blocks.HAMSTER_front_intersection, "FRONT"], [Lang.Blocks.HAMSTER_rear_intersection, "REAR"]]), 
  "DIRECTION").appendField(Lang.Blocks.HAMSTER_follow_line_until_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_follow_line_until = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = Entry.hw.portData, d = b.getField("COLOR"), e = b.getField("DIRECTION"), f = 4;
  "RIGHT" == e ? f = 5 : "FRONT" == e ? f = 6 : "REAR" == e && (f = 7);
  "WHITE" == d && (f += 7);
  if (b.isStart) {
    if (d = Entry.Hamster, c.lineTracerStateId != d.lineTracerStateId && (d.lineTracerStateId = c.lineTracerStateId, 64 == c.lineTracerState)) {
      return delete b.isStart, Entry.engine.isContinue = !1, d.setLineTracerMode(a, 0), b.callReturn();
    }
  } else {
    b.isStart = !0, a.leftWheel = 0, a.rightWheel = 0, Entry.Hamster.setLineTracerMode(a, f);
  }
  return b;
};
Blockly.Blocks.hamster_set_following_speed_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_following_speed_to_1).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "SPEED").appendField(Lang.Blocks.HAMSTER_set_following_speed_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_following_speed_to = function(a, b) {
  Entry.hw.sendQueue.lineTracerSpeed = Number(b.getField("SPEED", b));
  return b.callReturn();
};
Blockly.Blocks.hamster_stop = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_stop).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_stop = function(a, b) {
  a = Entry.hw.sendQueue;
  a.leftWheel = 0;
  a.rightWheel = 0;
  Entry.Hamster.setLineTracerMode(a, 0);
  return b.callReturn();
};
Blockly.Blocks.hamster_set_led_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_led_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_led, "LEFT"], [Lang.Blocks.HAMSTER_right_led, "RIGHT"], [Lang.Blocks.HAMSTER_both_leds, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_led_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.Blocks.HAMSTER_color_cyan, "3"], [Lang.General.blue, "1"], [Lang.Blocks.HAMSTER_color_magenta, 
  "5"], [Lang.Blocks.HAMSTER_color_white, "7"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_set_led_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_led_to = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getField("DIRECTION", b), d = Number(b.getField("COLOR", b));
  "LEFT" == c ? a.leftLed = d : ("RIGHT" != c && (a.leftLed = d), a.rightLed = d);
  return b.callReturn();
};
Blockly.Blocks.hamster_clear_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_left_led, "LEFT"], [Lang.Blocks.HAMSTER_right_led, "RIGHT"], [Lang.Blocks.HAMSTER_both_leds, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_clear_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_clear_led = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getField("DIRECTION", b);
  "LEFT" == c ? a.leftLed = 0 : ("RIGHT" != c && (a.leftLed = 0), a.rightLed = 0);
  return b.callReturn();
};
Blockly.Blocks.hamster_beep = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_beep).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_beep = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    a.buzzer = 0;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  a.buzzer = 440;
  a.note = 0;
  var c = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Hamster.removeTimeout(c);
  }, 200);
  Entry.Hamster.timeouts.push(c);
  return b;
};
Blockly.Blocks.hamster_change_buzzer_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_buzzer_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_buzzer_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_buzzer_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getNumberValue("VALUE");
  a.buzzer = void 0 != a.buzzer ? a.buzzer + c : c;
  a.note = 0;
  return b.callReturn();
};
Blockly.Blocks.hamster_set_buzzer_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_buzzer_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_buzzer_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_buzzer_to = function(a, b) {
  a = Entry.hw.sendQueue;
  a.buzzer = b.getNumberValue("VALUE");
  a.note = 0;
  return b.callReturn();
};
Blockly.Blocks.hamster_clear_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_clear_buzzer = function(a, b) {
  a = Entry.hw.sendQueue;
  a.buzzer = 0;
  a.note = 0;
  return b.callReturn();
};
Blockly.Blocks.hamster_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "4"], [Lang.General.note_c + "#", "5"], [Lang.General.note_d + "", "6"], [Lang.General.note_e + "b", "7"], [Lang.General.note_e + "", "8"], [Lang.General.note_f + "", "9"], [Lang.General.note_f + "#", "10"], [Lang.General.note_g + "", "11"], [Lang.General.note_g + "#", "12"], [Lang.General.note_a + "", "13"], [Lang.General.note_b + "b", "14"], [Lang.General.note_b + 
  "", "15"]]), "NOTE").appendField(Lang.Blocks.HAMSTER_play_note_for_2).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.HAMSTER_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_play_note_for = function(a, b) {
  var c = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    c.note = 0;
    return b.callReturn();
  }
  a = b.getNumberField("NOTE", b);
  var d = b.getNumberField("OCTAVE", b), e = 6E4 * b.getNumberValue("VALUE", b) / Entry.Hamster.tempo;
  b.isStart = !0;
  b.timeFlag = 1;
  c.buzzer = 0;
  c.note = a + 12 * (d - 1);
  if (100 < e) {
    var f = setTimeout(function() {
      c.note = 0;
      Entry.Hamster.removeTimeout(f);
    }, e - 100);
    Entry.Hamster.timeouts.push(f);
  }
  var g = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Hamster.removeTimeout(g);
  }, e);
  Entry.Hamster.timeouts.push(g);
  return b;
};
Blockly.Blocks.hamster_rest_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_rest_for_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_rest_for_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_rest_for = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.isStart;
    delete b.timeFlag;
    Entry.engine.isContinue = !1;
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  var c = b.getNumberValue("VALUE"), c = 6E4 * c / Entry.Hamster.tempo;
  a.buzzer = 0;
  a.note = 0;
  var d = setTimeout(function() {
    b.timeFlag = 0;
    Entry.Hamster.removeTimeout(d);
  }, c);
  Entry.Hamster.timeouts.push(d);
  return b;
};
Blockly.Blocks.hamster_change_tempo_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_tempo_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_tempo_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_tempo_by = function(a, b) {
  Entry.Hamster.tempo += b.getNumberValue("VALUE");
  1 > Entry.Hamster.tempo && (Entry.Hamster.tempo = 1);
  return b.callReturn();
};
Blockly.Blocks.hamster_set_tempo_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_tempo_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_tempo_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_tempo_to = function(a, b) {
  Entry.Hamster.tempo = b.getNumberValue("VALUE");
  1 > Entry.Hamster.tempo && (Entry.Hamster.tempo = 1);
  return b.callReturn();
};
Blockly.Blocks.hamster_set_port_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_port_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_a_b, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_set_port_to_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_analog_input, "0"], [Lang.Blocks.HAMSTER_digital_input, "1"], [Lang.Blocks.HAMSTER_servo_output, "8"], [Lang.Blocks.HAMSTER_pwm_output, "9"], [Lang.Blocks.HAMSTER_digital_output, 
  "10"]]), "MODE").appendField(Lang.Blocks.HAMSTER_set_port_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_port_to = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getField("PORT", b), d = Number(b.getField("MODE", b));
  "A" == c ? a.ioModeA = d : ("B" != c && (a.ioModeA = d), a.ioModeB = d);
  return b.callReturn();
};
Blockly.Blocks.hamster_change_output_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_output_by_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_a_b, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_change_output_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_output_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_output_by = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getField("PORT"), d = b.getNumberValue("VALUE");
  "A" == c ? a.outputA = void 0 != a.outputA ? a.outputA + d : d : ("B" != c && (a.outputA = void 0 != a.outputA ? a.outputA + d : d), a.outputB = void 0 != a.outputB ? a.outputB + d : d);
  return b.callReturn();
};
Blockly.Blocks.hamster_set_output_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_output_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_a_b, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_set_output_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_output_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_output_to = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getField("PORT"), d = b.getNumberValue("VALUE");
  "A" == c ? a.outputA = d : ("B" != c && (a.outputA = d), a.outputB = d);
  return b.callReturn();
};
Entry.Neobot = {name:"neobot", LOCAL_MAP:["IN1", "IN2", "IN3", "IR", "BAT"], REMOTE_MAP:"OUT1 OUT2 OUT3 DCR DCL SND FND OPT".split(" "), setZero:function() {
  for (var a in Entry.Neobot.REMOTE_MAP) {
    Entry.hw.sendQueue[Entry.Neobot.REMOTE_MAP[a]] = 0;
  }
  Entry.hw.update();
}, monitorTemplate:{imgPath:"hw/neobot.png", width:700, height:700, listPorts:{IR:{name:"\ub9ac\ubaa8\ucee8", type:"input", pos:{x:0, y:0}}, BAT:{name:"\ubca0\ud130\ub9ac", type:"input", pos:{x:0, y:0}}, SND:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, FND:{name:"FND", type:"output", pos:{x:0, y:0}}}, ports:{IN1:{name:"IN1", type:"input", pos:{x:270, y:200}}, IN2:{name:"IN2", type:"input", pos:{x:325, y:200}}, IN3:{name:"IN3", type:"input", pos:{x:325, y:500}}, DCL:{name:"L-Motor", type:"output", 
pos:{x:270, y:500}}, DCR:{name:"R-Motor", type:"output", pos:{x:435, y:500}}, OUT1:{name:"OUT1", type:"output", pos:{x:380, y:200}}, OUT2:{name:"OUT2", type:"output", pos:{x:435, y:200}}, OUT3:{name:"OUT3", type:"output", pos:{x:380, y:500}}}, mode:"both"}};
Blockly.Blocks.neobot_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1\ubc88 \ud3ec\ud2b8", "IN1"], ["2\ubc88 \ud3ec\ud2b8", "IN2"], ["3\ubc88 \ud3ec\ud2b8", "IN3"], ["\ub9ac\ubaa8\ucee8", "IR"], ["\ubc30\ud130\ub9ac", "BAT"]]), "PORT").appendField(" \uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.neobot_sensor_value = function(a, b) {
  a = b.getStringField("PORT");
  return Entry.hw.portData[a];
};
Blockly.Blocks.neobot_left_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc67c\ucabd\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\uc55e\uc73c\ub85c", "16"], ["\ub4a4\ub85c", "32"]]), "DIRECTION").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField("\uc758 \uc18d\ub3c4\ub85c \ud68c\uc804").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_left_motor = function(a, b) {
  a = b.getNumberField("SPEED");
  var c = b.getNumberField("DIRECTION");
  Entry.hw.sendQueue.DCL = a + c;
  return b.callReturn();
};
Blockly.Blocks.neobot_stop_left_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc67c\ucabd\ubaa8\ud130 \uc815\uc9c0").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_stop_left_motor = function(a, b) {
  Entry.hw.sendQueue.DCL = 0;
  return b.callReturn();
};
Blockly.Blocks.neobot_right_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc624\ub978\ucabd\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\uc55e\uc73c\ub85c", "16"], ["\ub4a4\ub85c", "32"]]), "DIRECTION").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField("\uc758 \uc18d\ub3c4\ub85c \ud68c\uc804").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_right_motor = function(a, b) {
  a = b.getNumberField("SPEED");
  var c = b.getNumberField("DIRECTION");
  Entry.hw.sendQueue.DCR = a + c;
  return b.callReturn();
};
Blockly.Blocks.neobot_stop_right_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc624\ub978\ucabd\ubaa8\ud130 \uc815\uc9c0").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_stop_right_motor = function(a, b) {
  Entry.hw.sendQueue.DCR = 0;
  return b.callReturn();
};
Blockly.Blocks.neobot_all_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc591\ucabd \ubaa8\ud130\ub97c ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField(" \uc758 \uc18d\ub3c4\ub85c ").appendField(new Blockly.FieldDropdown([["\uc804\uc9c4", "1"], ["\ud6c4\uc9c4", "2"], ["\uc81c\uc790\ub9ac \uc88c\ud68c\uc804", "3"], ["\uc81c\uc790\ub9ac \uc6b0\ud68c\uc804", "4"], 
  ["\uc88c\ud68c\uc804", "5"], ["\uc6b0\ud68c\uc804", "6"]]), "DIRECTION").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_all_motor = function(a, b) {
  b.getNumberField("TYPE");
  a = b.getNumberField("SPEED");
  switch(b.getNumberField("DIRECTION")) {
    case 1:
      Entry.hw.sendQueue.DCL = 16 + a;
      Entry.hw.sendQueue.DCR = 16 + a;
      break;
    case 2:
      Entry.hw.sendQueue.DCL = 32 + a;
      Entry.hw.sendQueue.DCR = 32 + a;
      break;
    case 3:
      Entry.hw.sendQueue.DCL = 32 + a;
      Entry.hw.sendQueue.DCR = 16 + a;
      break;
    case 4:
      Entry.hw.sendQueue.DCL = 16 + a;
      Entry.hw.sendQueue.DCR = 32 + a;
      break;
    case 5:
      Entry.hw.sendQueue.DCL = 0;
      Entry.hw.sendQueue.DCR = 16 + a;
      break;
    case 6:
      Entry.hw.sendQueue.DCL = 16 + a, Entry.hw.sendQueue.DCR = 0;
  }
  return b.callReturn();
};
Blockly.Blocks.neobot_set_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "1"], ["OUT2", "2"], ["OUT3", "3"]]), "PORT").appendField("\ud3ec\ud2b8\uc758 \uc11c\ubcf4\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["0\ub3c4", "0"], ["10\ub3c4", "10"], ["20\ub3c4", "20"], ["30\ub3c4", "30"], ["40\ub3c4", "40"], ["50\ub3c4", "50"], ["60\ub3c4", "60"], ["70\ub3c4", "70"], ["80\ub3c4", "80"], ["90\ub3c4", "90"], ["100\ub3c4", "100"], ["110\ub3c4", "110"], ["120\ub3c4", "120"], ["130\ub3c4", 
  "130"], ["140\ub3c4", "140"], ["150\ub3c4", "150"], ["160\ub3c4", "160"], ["170\ub3c4", "170"], ["180\ub3c4", "180"]]), "DEGREE").appendField(" \uc774\ub3d9").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_servo = function(a, b) {
  a = b.getNumberField("PORT");
  var c = b.getNumberField("DEGREE");
  Entry.hw.sendQueue["OUT" + a] = c;
  3 === a && (a = 4);
  Entry.hw.sendQueue.OPT |= a;
  return b.callReturn();
};
Blockly.Blocks.neobot_set_output = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "1"], ["OUT2", "2"], ["OUT3", "3"]]), "PORT").appendField("\ubc88 \ud3ec\ud2b8\uc758 \uac12\uc744");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ub9cc\ud07c \ucd9c\ub825").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_output = function(a, b) {
  a = b.getStringField("PORT", b);
  var c = b.getNumberValue("VALUE", b), d = a;
  0 > c ? c = 0 : 255 < c && (c = 255);
  3 === d && (d = 4);
  Entry.hw.sendQueue["OUT" + a] = c;
  Entry.hw.sendQueue.OPT &= ~d;
  return b.callReturn();
};
Blockly.Blocks.neobot_set_fnd = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("FND\uc5d0");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ucd9c\ub825").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_fnd = function(a, b) {
  a = b.getNumberValue("VALUE", b);
  255 < a ? a = 255 : 0 > a && (a = 0);
  Entry.hw.sendQueue.FND = a;
  return b.callReturn();
};
Blockly.Blocks.neobot_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uba5c\ub85c\ub514").appendField(new Blockly.FieldDropdown([["\ubb34\uc74c", "0"], [Lang.General.note_c, "1"], [Lang.General.note_c + "#", "2"], [Lang.General.note_d, "3"], [Lang.General.note_d + "#", "4"], [Lang.General.note_e, "5"], [Lang.General.note_f, "6"], [Lang.General.note_f + "#", "7"], [Lang.General.note_g, "8"], [Lang.General.note_g + "#", "9"], [Lang.General.note_a, "10"], [Lang.General.note_a + "#", "11"], [Lang.General.note_b, "12"]]), "NOTE").appendField("\uc744(\ub97c)").appendField(new Blockly.FieldDropdown([["1", 
  "0"], ["2", "1"], ["3", "2"], ["4", "3"], ["5", "4"], ["6", "5"]]), "OCTAVE").appendField("\uc625\ud0c0\ube0c\ub85c").appendField(new Blockly.FieldDropdown([["2\ubd84\uc74c\ud45c", "2"], ["4\ubd84\uc74c\ud45c", "4"], ["8\ubd84\uc74c\ud45c", "8"], ["16\ubd84\uc74c\ud45c", "16"]]), "DURATION");
  this.appendDummyInput().appendField("\uae38\uc774\ub9cc\ud07c \uc18c\ub9ac\ub0b4\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_play_note_for = function(a, b) {
  a = Entry.hw.sendQueue;
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return b;
    }
    delete b.timeFlag;
    delete b.isStart;
    Entry.hw.sendQueue.SND = 0;
    Entry.engine.isContinue = !1;
    return b.callReturn();
  }
  var c = b.getNumberField("NOTE", b), d = b.getNumberField("OCTAVE", b), e = b.getNumberField("DURATION", b), c = c + 12 * d;
  b.isStart = !0;
  b.timeFlag = 1;
  65 < c && (c = 65);
  a.SND = c;
  setTimeout(function() {
    b.timeFlag = 0;
  }, 1 / e * 2E3);
  return b;
};
Entry.Roborobo_Roduino = {name:"roborobo_roduino", INSTRUCTION:{DIGITAL_READ:1, DIGITAL_SET_MODE:2, DIGITAL_WRITE:3, ANALOG_WRITE:4, ANALOG_READ:5, MOTOR:6, COLOR:7}, setZero:function() {
  for (var a = 0;5 > a;a++) {
    Entry.hw.sendQueue[a] = 0;
  }
  this.ColorPin = [0, 0, 0];
  Entry.hw.update();
}, setSendData:function(a) {
  Entry.hw.sendQueue = a;
  Entry.hw.update();
  this.wait(32);
}, wait:function(a) {
  for (var b = (new Date).getTime(), c = b;c < b + a;) {
    c = (new Date).getTime();
  }
}, ColorPin:[0, 0, 0]};
Entry.Roborobo_SchoolKit = {name:"roborobo_schoolkit", INSTRUCTION:{DIGITAL_READ:1, DIGITAL_WRITE:2, MOTOR:3, COLOR:4, SERVO:5}, setZero:function() {
  for (var a = 0;5 > a;a++) {
    Entry.hw.sendQueue[a] = 0;
  }
  this.ColorPin = [0, 0, 0];
  Entry.hw.update();
}, setSendData:function(a) {
  Entry.hw.sendQueue = a;
  Entry.hw.update();
  this.wait(32);
}, wait:function(a) {
  for (var b = (new Date).getTime(), c = b;c < b + a;) {
    c = (new Date).getTime();
  }
}, ColorPin:[0, 0, 0]};
Blockly.Blocks.roduino_on_block = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_on);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.roduino_on_block = function(a, b) {
  return "1";
};
Blockly.Blocks.roduino_off_block = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_off);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.roduino_off_block = function(a, b) {
  return "0";
};
Blockly.Blocks.roduino_get_analog_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.roduino_get_analog_number = function(a, b) {
  return b.getStringField("PORT");
};
Blockly.Blocks.roduino_get_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.roduino_get_port_number = function(a, b) {
  return b.getStringField("PORT");
};
Blockly.Blocks.roduino_get_analog_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_analog_value_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_analog_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.roduino_get_analog_value = function(a, b) {
  a = parseInt(b.getValue("VALUE", b));
  Entry.Roduino.setSendData([Entry.Roduino.INSTRUCTION.ANALOG_READ, a]);
  return Entry.hw.getAnalogPortValue(a);
};
Blockly.Blocks.roduino_get_digital_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_get_digital_value_1);
  this.appendValueInput("VALUE").setCheck("Number");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.roduino_get_digital_value = function(a, b) {
  a = b.getNumberValue("VALUE");
  Entry.Roborobo_Roduino.setSendData([Entry.Roborobo_Roduino.INSTRUCTION.DIGITAL_READ, a]);
  return Entry.hw.portData[a - 2];
};
Blockly.Blocks.roduino_get_color = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_color + " ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_color_red, "red"], [Lang.Blocks.roborobo_color_green, "green"], [Lang.Blocks.roborobo_color_blue, "blue"], [Lang.Blocks.roborobo_color_yellow, "yellow"]]), "VALUE").appendField(Lang.Blocks.roborobo_color_detected);
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.roduino_get_color = function(a, b) {
  a = 0;
  b = b.getField("VALUE", b);
  var c = [Entry.hw.portData[Entry.Roborobo_Roduino.ColorPin[0] - 2], Entry.hw.portData[Entry.Roborobo_Roduino.ColorPin[1] - 2], Entry.hw.portData[Entry.Roborobo_Roduino.ColorPin[2] - 2]];
  switch(b) {
    case "red":
      1 == c[0] && 0 == c[1] && 0 == c[2] && (a = 1);
      break;
    case "green":
      0 == c[0] && 1 == c[1] && 0 == c[2] && (a = 1);
      break;
    case "blue":
      0 == c[0] && 0 == c[1] && 1 == c[2] && (a = 1);
      break;
    case "yellow":
      1 == c[0] && 1 == c[1] && 1 == c[2] && (a = 1);
  }
  return a;
};
Blockly.Blocks.roduino_set_digital = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_on, "on"], [Lang.Blocks.roborobo_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.roduino_set_digital = function(a, b) {
  a = b.getNumberValue("VALUE");
  var c = b.getField("OPERATOR");
  Entry.Roborobo_Roduino.setSendData([Entry.Roborobo_Roduino.INSTRUCTION.DIGITAL_WRITE, a, "on" == c ? 1 : 0]);
  return b.callReturn();
};
Blockly.Blocks.roduino_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_motor1, "motor1"], [Lang.Blocks.roborobo_motor2, "motor2"]]), "MODE");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_motor_CW, "cw"], [Lang.Blocks.roborobo_motor_CCW, "ccw"], [Lang.Blocks.roborobo_motor_stop, "stop"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.roduino_motor = function(a, b) {
  pin2 = 0;
  var c;
  value2 = 0;
  a = b.getField("MODE");
  c = b.getField("OPERATOR");
  "motor1" == a ? (a = 9, pin2 = 10) : (a = 11, pin2 = 12);
  "cw" == c ? (c = 1, value2 = 0) : "ccw" == c ? (c = 0, value2 = 1) : value2 = c = 0;
  Entry.Roborobo_Roduino.setSendData([Entry.Roborobo_Roduino.INSTRUCTION.MOTOR, a, c, pin2, value2]);
  return b.callReturn();
};
Blockly.Blocks.roduino_set_color_pin = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_color + "R : ");
  this.appendValueInput("RED").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(" G : ");
  this.appendValueInput("GREEN").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(" B : ");
  this.appendValueInput("BLUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.roduino_set_color_pin = function(a, b) {
  a = b.getNumberValue("RED", b);
  var c = b.getNumberValue("GREEN", b), d = b.getNumberValue("BLUE", b);
  Entry.Roborobo_Roduino.ColorPin = [a, c, d];
  Entry.Roborobo_Roduino.setSendData([Entry.Roborobo_Roduino.INSTRUCTION.COLOR, a, c, d]);
  return b.callReturn();
};
Blockly.Blocks.schoolkit_on_block = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_on);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.schoolkit_on_block = function(a, b) {
  return "1";
};
Blockly.Blocks.schoolkit_off_block = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_off);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.schoolkit_off_block = function(a, b) {
  return "0";
};
Blockly.Blocks.schoolkit_get_out_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "2"], ["OUT2", "3"], ["OUT3", "4"], ["OUT4", "5"], ["OUT5", "6"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.schoolkit_get_out_port_number = function(a, b) {
  return b.getNumberField("PORT");
};
Blockly.Blocks.schoolkit_set_output = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_on, "on"], [Lang.Blocks.roborobo_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.schoolkit_set_output = function(a, b) {
  a = b.getNumberValue("VALUE");
  var c = b.getField("OPERATOR");
  Entry.Roborobo_SchoolKit.setSendData([Entry.Roborobo_SchoolKit.INSTRUCTION.DIGITAL_WRITE, a, "on" == c ? 1 : 0]);
  return b.callReturn();
};
Blockly.Blocks.schoolkit_get_in_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["IN1", "7"], ["IN2", "8"], ["IN3", "9"], ["IN4", "10"], ["IN5", "11"], ["IN6", "12"], ["IN7", "13"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.schoolkit_get_in_port_number = function(a, b) {
  return b.getNumberField("PORT");
};
Blockly.Blocks.schoolkit_get_input_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_get_digital_value_1);
  this.appendValueInput("VALUE").setCheck("Number");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.schoolkit_get_input_value = function(a, b) {
  a = b.getNumberValue("VALUE");
  Entry.Roborobo_SchoolKit.setSendData([Entry.Roborobo_SchoolKit.INSTRUCTION.DIGITAL_READ, a]);
  return Entry.hw.portData[a - 7];
};
Blockly.Blocks.schoolkit_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_motor1, "motor1"], [Lang.Blocks.roborobo_motor2, "motor2"]]), "MODE");
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.roborobo_motor_CW, "cw"], [Lang.Blocks.roborobo_motor_CCW, "ccw"], [Lang.Blocks.roborobo_motor_stop, "stop"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.schoolkit_motor = function(a, b) {
  var c;
  c = b.getField("MODE");
  a = b.getField("OPERATOR");
  var d = b.getNumberValue("VALUE");
  c = "motor1" == c ? 7 : 8;
  255 < d ? d = 255 : 0 > d && (d = 0);
  "cw" == a ? Entry.Roborobo_SchoolKit.setSendData([Entry.Roborobo_SchoolKit.INSTRUCTION.MOTOR, 1, c, d]) : "ccw" == a ? Entry.Roborobo_SchoolKit.setSendData([Entry.Roborobo_SchoolKit.INSTRUCTION.MOTOR, 2, c, d]) : "stop" == a && Entry.Roborobo_SchoolKit.setSendData([Entry.Roborobo_SchoolKit.INSTRUCTION.MOTOR, 0, c, d]);
  return b.callReturn();
};
Blockly.Blocks.schoolkit_set_servo_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_1);
  this.appendValueInput("PIN").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_num_pin_2);
  this.appendDummyInput().appendField(" : ");
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.roborobo_degree);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.schoolkit_set_servo_value = function(a, b) {
  a = b.getNumberValue("PIN");
  var c = b.getNumberValue("VALUE");
  0 > c ? c = 0 : 180 < c && (c = 180);
  Entry.Roborobo_SchoolKit.setSendData([Entry.Roborobo_SchoolKit.INSTRUCTION.SERVO, a, c]);
  return b.callReturn();
};
Entry.Robotis_carCont = {INSTRUCTION:{NONE:0, WRITE:3, READ:2}, CONTROL_TABLE:{CM_LED:[67, 1], CM_SPRING_RIGHT:[69, 1, 69, 2], CM_SPRING_LEFT:[70, 1, 69, 2], CM_SWITCH:[71, 1], CM_SOUND_DETECTED:[86, 1], CM_SOUND_DETECTING:[87, 1], CM_IR_LEFT:[91, 2, 91, 4], CM_IR_RIGHT:[93, 2, 91, 4], CM_CALIBRATION_LEFT:[95, 2], CM_CALIBRATION_RIGHT:[97, 2], AUX_MOTOR_SPEED_LEFT:[152, 2], AUX_MOTOR_SPEED_RIGHT:[154, 2]}, setZero:function() {
  Entry.hw.sendQueue.setZero = [1];
  this.update();
  this.setRobotisData(null);
  Entry.hw.sendQueue.setZero = null;
  this.update();
  this.setRobotisData([[Entry.Robotis_carCont.INSTRUCTION.WRITE, 152, 2, 0], [Entry.Robotis_carCont.INSTRUCTION.WRITE, 154, 2, 0]]);
  this.update();
}, name:"robotis_carCont", delay:40, postCallReturn:function(a, b, c) {
  if (0 >= c) {
    return this.setRobotisData(b), this.update(), a.callReturn();
  }
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return this.setRobotisData(null), a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.engine.isContinue = !1;
    this.update();
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  this.setRobotisData(b);
  setTimeout(function() {
    a.timeFlag = 0;
  }, c);
  return a;
}, wait:function(a, b) {
  Entry.hw.socket.send(JSON.stringify(a));
  for (var c = a = (new Date).getTime();c < a + b;) {
    c = (new Date).getTime();
  }
}, update:function() {
  Entry.hw.update();
  var a = Entry.hw.sendQueue.ROBOTIS_DATA;
  a && a.forEach(function(b) {
    b.send = !0;
  });
  this.setRobotisData(null);
}, filterSendData:function() {
  var a = Entry.hw.sendQueue.ROBOTIS_DATA;
  return a ? a.filter(function(b) {
    return !0 !== b.send;
  }) : null;
}, setRobotisData:function(a) {
  var b = this.filterSendData();
  Entry.hw.sendQueue.ROBOTIS_DATA = null == a ? b : b ? b.concat(a) : a;
}};
Entry.Robotis_openCM70 = {INSTRUCTION:{NONE:0, WRITE:3, READ:2}, CONTROL_TABLE:{CM_LED_R:[79, 1], CM_LED_G:[80, 1], CM_LED_B:[81, 1], CM_BUZZER_INDEX:[84, 1], CM_BUZZER_TIME:[85, 1], CM_SOUND_DETECTED:[86, 1], CM_SOUND_DETECTING:[87, 1], CM_USER_BUTTON:[26, 1], CM_MOTION:[66, 1], AUX_SERVO_POSITION:[152, 2], AUX_IR:[168, 2], AUX_TOUCH:[202, 1], AUX_TEMPERATURE:[234, 1], AUX_ULTRASONIC:[242, 1], AUX_MAGNETIC:[250, 1], AUX_MOTION_DETECTION:[258, 1], AUX_COLOR:[266, 1], AUX_CUSTOM:[216, 2], AUX_BRIGHTNESS:[288, 
2], AUX_HYDRO_THEMO_HUMIDITY:[274, 1], AUX_HYDRO_THEMO_TEMPER:[282, 1], AUX_SERVO_MODE:[126, 1], AUX_SERVO_SPEED:[136, 2], AUX_MOTOR_SPEED:[136, 2], AUX_LED_MODULE:[210, 1]}, setZero:function() {
  Entry.hw.sendQueue.setZero = [1];
  Entry.Robotis_carCont.update();
  Entry.Robotis_carCont.setRobotisData(null);
  Entry.hw.sendQueue.setZero = null;
  Entry.Robotis_carCont.update();
  Entry.Robotis_carCont.setRobotisData([[Entry.Robotis_openCM70.INSTRUCTION.WRITE, 136, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 138, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 140, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 142, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 144, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 146, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 79, 1, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 80, 1, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 
  81, 1, 0]]);
  Entry.Robotis_carCont.update();
}, name:"robotis_openCM70", delay:15};
Blockly.Blocks.robotis_openCM70_cm_custom_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_custom);
  this.appendDummyInput().appendField("(");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(")");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["BYTE", "BYTE"], ["WORD", "WORD"], ["DWORD", "DWORD"]]), "SIZE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.robotis_openCM70_cm_custom_value = function(a, b) {
  a = Entry.Robotis_openCM70.INSTRUCTION.READ;
  var c = 0, d = b.getStringField("SIZE");
  "BYTE" == d ? c = 1 : "WORD" == d ? c = 2 : "DWORD" == d && (c = 4);
  b = b.getNumberValue("VALUE");
  Entry.Robotis_carCont.setRobotisData([[a, b, c, 0, c]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[b];
};
Blockly.Blocks.robotis_openCM70_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.sensorList()), "SENSOR");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, sensorList:function() {
  var a = [];
  a.push([Lang.Blocks.robotis_cm_sound_detected, "CM_SOUND_DETECTED"]);
  a.push([Lang.Blocks.robotis_cm_sound_detecting, "CM_SOUND_DETECTING"]);
  a.push([Lang.Blocks.robotis_cm_user_button, "CM_USER_BUTTON"]);
  return a;
}};
Entry.block.robotis_openCM70_sensor_value = function(a, b) {
  a = Entry.Robotis_openCM70.INSTRUCTION.READ;
  var c = 0, d = 0, e = 0, f = 0;
  b = b.getStringField("SENSOR");
  "CM_SOUND_DETECTED" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1]) : "CM_SOUND_DETECTING" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[0], 
  d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[1]) : "CM_USER_BUTTON" == b && (e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[0], d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[1]);
  e += 0 * f;
  Entry.Robotis_carCont.setRobotisData([[a, c, d, 0, f]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[e];
};
Blockly.Blocks.robotis_openCM70_aux_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.portList()), "PORT");
  this.appendDummyInput().appendField(" ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.sensorList()), "SENSOR");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, portList:function() {
  var a = [];
  a.push([Lang.Blocks.robotis_common_port_3, "PORT_3"]);
  a.push([Lang.Blocks.robotis_common_port_4, "PORT_4"]);
  a.push([Lang.Blocks.robotis_common_port_5, "PORT_5"]);
  a.push([Lang.Blocks.robotis_common_port_6, "PORT_6"]);
  return a;
}, sensorList:function() {
  var a = [];
  a.push([Lang.Blocks.robotis_aux_servo_position, "AUX_SERVO_POSITION"]);
  a.push([Lang.Blocks.robotis_aux_ir, "AUX_IR"]);
  a.push([Lang.Blocks.robotis_aux_touch, "AUX_TOUCH"]);
  a.push([Lang.Blocks.robotis_aux_brightness, "AUX_BRIGHTNESS"]);
  a.push([Lang.Blocks.robotis_aux_hydro_themo_humidity, "AUX_HYDRO_THEMO_HUMIDITY"]);
  a.push([Lang.Blocks.robotis_aux_hydro_themo_temper, "AUX_HYDRO_THEMO_TEMPER"]);
  a.push([Lang.Blocks.robotis_aux_temperature, "AUX_TEMPERATURE"]);
  a.push([Lang.Blocks.robotis_aux_ultrasonic, "AUX_ULTRASONIC"]);
  a.push([Lang.Blocks.robotis_aux_magnetic, "AUX_MAGNETIC"]);
  a.push([Lang.Blocks.robotis_aux_motion_detection, "AUX_MOTION_DETECTION"]);
  a.push([Lang.Blocks.robotis_aux_color, "AUX_COLOR"]);
  a.push([Lang.Blocks.robotis_aux_custom, "AUX_CUSTOM"]);
  return a;
}};
Entry.block.robotis_openCM70_aux_sensor_value = function(a, b) {
  a = Entry.Robotis_openCM70.INSTRUCTION.READ;
  var c = 0, d = 0, e = 0, f = 0, g = b.getStringField("PORT");
  b = b.getStringField("SENSOR");
  var h = 0;
  "PORT_3" == g ? h = 2 : "PORT_4" == g ? h = 3 : "PORT_5" == g ? h = 4 : "PORT_6" == g && (h = 5);
  "AUX_SERVO_POSITION" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1]) : "AUX_IR" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[0], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[1]) : 
  "AUX_TOUCH" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[0], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[1]) : "AUX_TEMPERATURE" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[0], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[1]) : 
  "AUX_BRIGHTNESS" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[0], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[1]) : "AUX_HYDRO_THEMO_HUMIDITY" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[0], 
  d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[1]) : "AUX_HYDRO_THEMO_TEMPER" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[0], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[1]) : "AUX_ULTRASONIC" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[1], 
  c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[0], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[1]) : "AUX_MAGNETIC" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[0], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[1]) : "AUX_MOTION_DETECTION" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[1], 
  c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[0], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[1]) : "AUX_COLOR" == b ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[0], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[1]) : "AUX_CUSTOM" == b && (e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1], 
  c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], d = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1]);
  e += h * f;
  0 != h && (d = 6 * f);
  Entry.Robotis_carCont.setRobotisData([[a, c, d, 0, f]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[e];
};
Blockly.Blocks.robotis_openCM70_cm_buzzer_index = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_buzzer_index);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.note_a + "(0)", "0"], [Lang.General.note_a + "#(1)", "1"], [Lang.General.note_b + "(2)", "2"], [Lang.General.note_c + "(3)", "3"], [Lang.General.note_c + "#(4)", "4"], [Lang.General.note_d + "(5)", "5"], [Lang.General.note_d + "#(6)", "6"], [Lang.General.note_e + "(7)", "7"], [Lang.General.note_f + "(8)", "8"], [Lang.General.note_f + "#(9)", "9"], [Lang.General.note_g + "(10)", "10"], [Lang.General.note_g + "#(11)", "11"], 
  [Lang.General.note_a + "(12)", "12"], [Lang.General.note_a + "#(13)", "13"], [Lang.General.note_b + "(14)", "14"], [Lang.General.note_c + "(15)", "15"], [Lang.General.note_c + "#(16)", "16"], [Lang.General.note_d + "(17)", "17"], [Lang.General.note_d + "#(18)", "18"], [Lang.General.note_e + "(19)", "19"], [Lang.General.note_f + "(20)", "20"], [Lang.General.note_f + "#(21)", "21"], [Lang.General.note_g + "(22)", "22"], [Lang.General.note_g + "#(23)", "23"], [Lang.General.note_a + "(24)", "24"], 
  [Lang.General.note_a + "#(25)", "25"], [Lang.General.note_b + "(26)", "26"], [Lang.General.note_c + "(27)", "27"], [Lang.General.note_c + "#(28)", "28"], [Lang.General.note_d + "(29)", "29"], [Lang.General.note_d + "#(30)", "30"], [Lang.General.note_e + "(31)", "31"], [Lang.General.note_f + "(32)", "32"], [Lang.General.note_f + "#(33)", "33"], [Lang.General.note_g + "(34)", "34"], [Lang.General.note_g + "#(35)", "35"], [Lang.General.note_a + "(36)", "36"], [Lang.General.note_a + "#(37)", "37"], 
  [Lang.General.note_b + "(38)", "38"], [Lang.General.note_c + "(39)", "39"], [Lang.General.note_c + "#(40)", "40"], [Lang.General.note_d + "(41)", "41"], [Lang.General.note_d + "#(42)", "42"], [Lang.General.note_e + "(43)", "43"], [Lang.General.note_f + "(44)", "44"], [Lang.General.note_f + "#(45)", "45"], [Lang.General.note_g + "(46)", "46"], [Lang.General.note_g + "#(47)", "47"], [Lang.General.note_a + "(48)", "48"], [Lang.General.note_a + "#(49)", "49"], [Lang.General.note_b + "(50)", "50"], 
  [Lang.General.note_c + "(51)", "51"]]), "CM_BUZZER_INDEX").appendField(Lang.Blocks.LOOKS_dialog_time_2);
  this.appendValueInput("CM_BUZZER_TIME").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_3).appendField(Lang.Blocks.robotis_common_play_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_buzzer_index = function(a, b) {
  a = b.getField("CM_BUZZER_INDEX", b);
  var c = b.getNumberValue("CM_BUZZER_TIME", b), d = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e, f, g;
  e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[0];
  f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[1];
  g = parseInt(10 * c);
  50 < g && (g = 50);
  return Entry.Robotis_carCont.postCallReturn(b, [[d, e, f, g], [d, Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[0], Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[1], a]], 1E3 * c);
};
Blockly.Blocks.robotis_openCM70_cm_buzzer_melody = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_buzzer_melody);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"], ["18", "18"], ["19", "19"], ["20", "20"], ["21", "21"], ["22", "22"], ["23", "23"], ["24", "24"]]), "CM_BUZZER_MELODY");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_index_number);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_play_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_buzzer_melody = function(a, b) {
  a = b.getField("CM_BUZZER_MELODY", b);
  var c = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  return Entry.Robotis_carCont.postCallReturn(b, [[c, Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[0], Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[1], 255], [c, Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[0], Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[1], a]], 1E3);
};
Blockly.Blocks.robotis_openCM70_cm_sound_detected_clear = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_clear_sound_detected).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_sound_detected_clear = function(a, b) {
  return Entry.Robotis_carCont.postCallReturn(b, [[Entry.Robotis_openCM70.INSTRUCTION.WRITE, Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1], 0]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_red_color, "CM_LED_R"], [Lang.Blocks.robotis_common_green_color, "CM_LED_G"], [Lang.Blocks.robotis_common_blue_color, "CM_LED_B"]]), "CM_LED").appendField("LED").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_led = function(a, b) {
  a = b.getField("CM_LED", b);
  var c = b.getField("VALUE", b), d = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e = 0, f = 0;
  "CM_LED_R" == a ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_R[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_R[1]) : "CM_LED_G" == a ? (e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_G[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_G[1]) : "CM_LED_B" == a && (e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_B[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_B[1]);
  return Entry.Robotis_carCont.postCallReturn(b, [[d, e, f, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_motion = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_motion);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_index_number);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_play_motion).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_motion = function(a, b) {
  a = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  var c, d, e;
  c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_MOTION[0];
  d = Entry.Robotis_openCM70.CONTROL_TABLE.CM_MOTION[1];
  e = b.getNumberValue("VALUE", b);
  return Entry.Robotis_carCont.postCallReturn(b, [[a, c, d, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_motor_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_1, "1"], [Lang.Blocks.robotis_common_port_2, "2"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_motor_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_openCM70_aux_motor_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_motor_speed = function(a, b) {
  a = b.getField("PORT", b);
  var c = b.getField("DIRECTION_ANGLE", b), d = b.getNumberValue("VALUE"), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f, g;
  f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTOR_SPEED[0];
  g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTOR_SPEED[1];
  "CW" == c ? (d += 1024, 2047 < d && (d = 2047)) : 1023 < d && (d = 1023);
  return Entry.Robotis_carCont.postCallReturn(b, [[e, f + (a - 1) * g, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_mode = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_mode_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_wheel_mode, "0"], [Lang.Blocks.robotis_common_joint_mode, "1"]]), "MODE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_mode = function(a, b) {
  a = b.getField("PORT", b);
  var c = b.getField("MODE", b), d = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e, f;
  e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_MODE[0];
  f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_MODE[1];
  return Entry.Robotis_carCont.postCallReturn(b, [[d, e + (a - 1) * f, f, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_openCM70_aux_servo_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_speed = function(a, b) {
  a = b.getField("PORT", b);
  var c = b.getField("DIRECTION_ANGLE", b), d = b.getNumberValue("VALUE"), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f, g;
  f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_SPEED[0];
  g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_SPEED[1];
  "CW" == c ? (d += 1024, 2047 < d && (d = 2047)) : 1023 < d && (d = 1023);
  return Entry.Robotis_carCont.postCallReturn(b, [[e, f + (a - 1) * g, g, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_position = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_position_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_position = function(a, b) {
  a = b.getField("PORT", b);
  var c = b.getNumberValue("VALUE"), d = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e, f;
  e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0];
  f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1];
  1023 < c ? c = 1023 : 0 > c && (c = 0);
  return Entry.Robotis_carCont.postCallReturn(b, [[d, e + (a - 1) * f, f, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_led_module = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_led_module_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_cm_led_both + Lang.Blocks.robotis_common_off, "0"], [Lang.Blocks.robotis_cm_led_right + Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_cm_led_left + 
  Lang.Blocks.robotis_common_on, "2"], [Lang.Blocks.robotis_cm_led_both + Lang.Blocks.robotis_common_on, "3"]]), "LED_MODULE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_led_module = function(a, b) {
  a = b.getField("PORT", b);
  var c = b.getField("LED_MODULE", b), d = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e, f;
  e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_LED_MODULE[0];
  f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_LED_MODULE[1];
  return Entry.Robotis_carCont.postCallReturn(b, [[d, e + (a - 1) * f, f, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_custom = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_custom_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_custom = function(a, b) {
  a = b.getField("PORT", b);
  var c = b.getNumberValue("VALUE"), d = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e, f;
  e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0];
  f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1];
  return Entry.Robotis_carCont.postCallReturn(b, [[d, e + (a - 1) * f, f, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_custom = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_custom);
  this.appendDummyInput().appendField("(");
  this.appendValueInput("ADDRESS").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(")");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_case_01);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_custom = function(a, b) {
  a = Entry.Robotis_openCM70.INSTRUCTION.WRITE;
  var c, d;
  c = b.getNumberValue("ADDRESS");
  d = b.getNumberValue("VALUE");
  return Entry.Robotis_carCont.postCallReturn(b, [[a, c, 65535 < d ? 4 : 255 < d ? 2 : 1, d]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_carCont_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_cm_spring_left, "CM_SPRING_LEFT"], [Lang.Blocks.robotis_cm_spring_right, "CM_SPRING_RIGHT"], [Lang.Blocks.robotis_cm_switch, "CM_SWITCH"], [Lang.Blocks.robotis_cm_sound_detected, "CM_SOUND_DETECTED"], [Lang.Blocks.robotis_cm_sound_detecting, "CM_SOUND_DETECTING"], [Lang.Blocks.robotis_cm_ir_left, "CM_IR_LEFT"], [Lang.Blocks.robotis_cm_ir_right, "CM_IR_RIGHT"], [Lang.Blocks.robotis_cm_calibration_left, 
  "CM_CALIBRATION_LEFT"], [Lang.Blocks.robotis_cm_calibration_right, "CM_CALIBRATION_RIGHT"]]), "SENSOR").appendField(" ").appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.robotis_carCont_sensor_value = function(a, b) {
  a = Entry.Robotis_carCont.INSTRUCTION.READ;
  var c = 0, d = 0, e = 0, f = 0;
  b = b.getStringField("SENSOR");
  "CM_SPRING_LEFT" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[2], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[3]) : "CM_SPRING_RIGHT" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[2], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[3]) : 
  "CM_SWITCH" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[0], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[1]) : "CM_SOUND_DETECTED" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1]) : 
  "CM_SOUND_DETECTING" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[0], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[1]) : "CM_IR_LEFT" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[2], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[3]) : 
  "CM_IR_RIGHT" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[2], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[3]) : "CM_CALIBRATION_LEFT" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1]) : 
  "CM_CALIBRATION_RIGHT" == b ? (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], d = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1]) : "CM_BUTTON_STATUS" == b && (e = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[0], f = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[0], 
  d = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[1]);
  Entry.Robotis_carCont.setRobotisData([[a, c, d, 0, f]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[e];
};
Blockly.Blocks.robotis_carCont_cm_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_led_4).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE_LEFT").appendField(", ").appendField(Lang.Blocks.robotis_cm_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE_RIGHT").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_led = function(a, b) {
  a = b.getField("VALUE_LEFT", b);
  var c = b.getField("VALUE_RIGHT", b), d = Entry.Robotis_carCont.INSTRUCTION.WRITE, e, f, g = 0;
  e = Entry.Robotis_carCont.CONTROL_TABLE.CM_LED[0];
  f = Entry.Robotis_carCont.CONTROL_TABLE.CM_LED[1];
  1 == a && 1 == c ? g = 9 : 1 == a && 0 == c && (g = 8);
  0 == a && 1 == c && (g = 1);
  return Entry.Robotis_carCont.postCallReturn(b, [[d, e, f, g]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_cm_sound_detected_clear = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_clear_sound_detected).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_sound_detected_clear = function(a, b) {
  return Entry.Robotis_carCont.postCallReturn(b, [[Entry.Robotis_carCont.INSTRUCTION.WRITE, Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1], 0]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_aux_motor_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.robotis_carCont_aux_motor_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_carCont_aux_motor_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_aux_motor_speed = function(a, b) {
  var c = b.getField("DIRECTION", b);
  a = b.getField("DIRECTION_ANGLE", b);
  var d = b.getNumberValue("VALUE"), e = Entry.Robotis_carCont.INSTRUCTION.WRITE, f;
  "LEFT" == c ? (c = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_LEFT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_LEFT[1]) : (c = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_RIGHT[0], f = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_RIGHT[1]);
  "CW" == a ? (d += 1024, 2047 < d && (d = 2047)) : 1023 < d && (d = 1023);
  return Entry.Robotis_carCont.postCallReturn(b, [[e, c, f, d]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_cm_calibration = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.robotis_carCont_calibration_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_calibration = function(a, b) {
  var c = b.getField("DIRECTION", b);
  a = b.getNumberValue("VALUE");
  var d = Entry.Robotis_carCont.INSTRUCTION.WRITE, e;
  "LEFT" == c ? (c = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1]) : (c = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1]);
  return Entry.Robotis_carCont.postCallReturn(b, [[d, c, e, a]], Entry.Robotis_carCont.delay);
};
Entry.Xbot = {PORT_MAP:{rightWheel:0, leftWheel:0, head:90, armR:90, armL:90, analogD5:127, analogD6:127, D4:0, D7:0, D12:0, D13:0, ledR:0, ledG:0, ledB:0, lcdNum:0, lcdTxt:"                ", note:262, duration:0}, setZero:function() {
  var a = Entry.Xbot.PORT_MAP, b = Entry.hw.sendQueue, c;
  for (c in a) {
    b[c] = a[c];
  }
  Entry.hw.update();
  Entry.Xbot.removeAllTimeouts();
}, timeouts:[], removeTimeout:function(a) {
  clearTimeout(a);
  var b = this.timeouts;
  a = b.indexOf(a);
  0 <= a && b.splice(a, 1);
}, removeAllTimeouts:function() {
  var a = this.timeouts, b;
  for (b in a) {
    clearTimeout(a[b]);
  }
  this.timeouts = [];
}, name:"xbot_epor_edge"};
Blockly.Blocks.xbot_digitalInput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_D2_digitalInput, "D2"], [Lang.Blocks.XBOT_D3_digitalInput, "D3"], [Lang.Blocks.XBOT_D11_digitalInput, "D11"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.xbot_digitalInput = function(a, b) {
  a = Entry.hw.portData;
  b = b.getField("DEVICE");
  return a[b];
};
Blockly.Blocks.xbot_analogValue = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_CDS, "light"], [Lang.Blocks.XBOT_MIC, "mic"], [Lang.Blocks.XBOT_analog0, "adc0"], [Lang.Blocks.XBOT_analog1, "adc1"], [Lang.Blocks.XBOT_analog2, "adc2"], [Lang.Blocks.XBOT_analog3, "adc3"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.xbot_analogValue = function(a, b) {
  a = Entry.hw.portData;
  b = b.getField("DEVICE");
  return a[b];
};
Blockly.Blocks.xbot_digitalOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_digital).appendField(new Blockly.FieldDropdown([["LED", "D13"], ["D4", "D4"], ["D7", "D7"], ["D12 ", "D12"]]), "DEVICE").appendField(Lang.Blocks.XBOT_pin_OutputValue).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_High, "HIGH"], [Lang.Blocks.XBOT_Low, "LOW"]]), "VALUE");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_digitalOutput = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getStringField("DEVICE", b), d = b.getStringField("VALUE", b);
  a.D13 = "D13" == c && "HIGH" == d ? 1 : 0;
  a.D4 = "D4" == c && "HIGH" == d ? 1 : 0;
  a.D7 = "D7" == c && "HIGH" == d ? 1 : 0;
  a.D12 = "D12" == c && "HIGH" == d ? 1 : 0;
  return b.callReturn();
};
Blockly.Blocks.xbot_analogOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_analog).appendField(new Blockly.FieldDropdown([["D5", "analogD5"], ["D6", "analogD6"]]), "DEVICE").appendField(Lang.Blocks.XBOT_pin_Output_Value);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_analogOutput = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getStringField("DEVICE", b), d = b.getNumberValue("VALUE", b);
  "analogD5" == c ? a.analogD5 = d : "analogD6" == c && (a.analogD6 = d);
  return b.callReturn();
};
Blockly.Blocks.xbot_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_Servo).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_Head, "head"], [Lang.Blocks.XBOT_ArmR, "right"], [Lang.Blocks.XBOT_ArmL, "left"]]), "DEVICE").appendField(Lang.Blocks.XBOT_angle);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_servo = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getStringField("DEVICE", b), d = b.getNumberValue("VALUE", b);
  "head" == c ? a.head = d : "right" == c ? a.armR = d : "left" == c && (a.armL = d);
  return b.callReturn();
};
Blockly.Blocks.xbot_oneWheel = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_DC).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_rightWheel, "rightWheel"], [Lang.Blocks.XBOT_leftWheel, "leftWheel"], [Lang.Blocks.XBOT_bothWheel, "bothWheel"]]), "DEVICE").appendField(Lang.Blocks.XBOT_speed);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_oneWheel = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getStringField("DEVICE", b), d = b.getNumberValue("VALUE", b);
  "rightWheel" == c ? a.rightWheel = d : "leftWheel" == c ? a.leftWheel = d : a.rightWheel = a.leftWheel = d;
  return b.callReturn();
};
Blockly.Blocks.xbot_twoWheel = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_rightSpeed);
  this.appendValueInput("rightWheel").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_leftSpeed);
  this.appendValueInput("leftWheel").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_twoWheel = function(a, b) {
  a = Entry.hw.sendQueue;
  a.rightWheel = b.getNumberValue("rightWheel");
  a.leftWheel = b.getNumberValue("leftWheel");
  return b.callReturn();
};
Blockly.Blocks.xbot_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_R);
  this.appendValueInput("ledR").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_G);
  this.appendValueInput("ledG").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_B);
  this.appendValueInput("ledB").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_rgb = function(a, b) {
  a = Entry.hw.sendQueue;
  a.ledR = b.getNumberValue("ledR");
  a.ledG = b.getNumberValue("ledG");
  a.ledB = b.getNumberValue("ledB");
  return b.callReturn();
};
Blockly.Blocks.xbot_rgb_picker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_color).appendField(new Blockly.FieldColour("#ff0000"), "VALUE").appendField(Lang.Blocks.XBOT_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_rgb_picker = function(a, b) {
  a = b.getStringField("VALUE");
  var c = Entry.hw.sendQueue;
  c.ledR = parseInt(.3 * parseInt(a.substr(1, 2), 16));
  c.ledG = parseInt(.3 * parseInt(a.substr(3, 2), 16));
  c.ledB = parseInt(.3 * parseInt(a.substr(5, 2), 16));
  return b.callReturn();
};
Blockly.Blocks.xbot_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_c, "C"], [Lang.Blocks.XBOT_d, "D"], [Lang.Blocks.XBOT_e, "E"], [Lang.Blocks.XBOT_f, "F"], [Lang.Blocks.XBOT_g, "G"], [Lang.Blocks.XBOT_a, "A"], [Lang.Blocks.XBOT_b, "B"]]), "NOTE").appendField(" ").appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.HAMSTER_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_melody_ms).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_buzzer = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getStringField("NOTE", b), d = b.getStringField("OCTAVE", b), e = b.getNumberValue("VALUE", b), c = c + d;
  a.note = "C2" == c ? 65 : "D2" == c ? 73 : "E2" == c ? 82 : "F2" == c ? 87 : "G2" == c ? 98 : "A2" == c ? 110 : "B2" == c ? 123 : "C3" == c ? 131 : "D3" == c ? 147 : "E3" == c ? 165 : "F3" == c ? 175 : "G3" == c ? 196 : "A3" == c ? 220 : "B3" == c ? 247 : "C4" == c ? 262 : "D4" == c ? 294 : "E4" == c ? 330 : "F4" == c ? 349 : "G4" == c ? 392 : "A4" == c ? 440 : "B4" == c ? 494 : "C5" == c ? 523 : "D5" == c ? 587 : "E5" == c ? 659 : "F5" == c ? 698 : "G5" == c ? 784 : "A5" == c ? 880 : "B5" == c ? 
  988 : "C6" == c ? 1047 : "D6" == c ? 1175 : "E6" == c ? 1319 : "F6" == c ? 1397 : "G6" == c ? 1568 : "A6" == c ? 1760 : "B6" == c ? 1976 : "C7" == c ? 2093 : "D7" == c ? 2349 : "E7" == c ? 2637 : "F7" == c ? 2794 : "G7" == c ? 3136 : "A7" == c ? 3520 : "B7" == c ? 3951 : 262;
  a.duration = 40 * e;
  return b.callReturn();
};
Blockly.Blocks.xbot_lcd = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("LCD").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"]]), "LINE").appendField(Lang.Blocks.XBOT_Line).appendField(", ").appendField(Lang.Blocks.XBOT_outputValue);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_lcd = function(a, b) {
  a = Entry.hw.sendQueue;
  var c = b.getNumberField("LINE", b), d = b.getStringValue("VALUE", b);
  0 == c ? (a.lcdNum = 0, a.lcdTxt = d) : 1 == c && (a.lcdNum = 1, a.lcdTxt = d);
  return b.callReturn();
};
Entry.Collection = function(a) {
  this.length = 0;
  this._hashMap = {};
  this._observers = [];
  this.set(a);
};
(function(a, b) {
  a.set = function(a) {
    for (;this.length;) {
      b.pop.call(this);
    }
    var c = this._hashMap, e;
    for (e in c) {
      delete c[e];
    }
    if (void 0 !== a) {
      e = 0;
      for (var f = a.length;e < f;e++) {
        var g = a[e];
        c[g.id] = g;
        b.push.call(this, g);
      }
    }
  };
  a.push = function(a) {
    this._hashMap[a.id] = a;
    b.push.call(this, a);
  };
  a.unshift = function() {
    for (var a = Array.prototype.slice.call(arguments, 0), d = this._hashMap, e = a.length - 1;0 <= e;e--) {
      var f = a[e];
      b.unshift.call(this, f);
      d[f.id] = f;
    }
  };
  a.insert = function(a, d) {
    b.splice.call(this, d, 0, a);
    this._hashMap[a.id] = a;
  };
  a.has = function(b) {
    return !!this._hashMap[b];
  };
  a.get = function(b) {
    return this._hashMap[b];
  };
  a.at = function(b) {
    return this[b];
  };
  a.getAll = function() {
    for (var b = this.length, a = [], e = 0;e < b;e++) {
      a.push(this[e]);
    }
    return a;
  };
  a.indexOf = function(a) {
    return b.indexOf.call(this, a);
  };
  a.find = function(b) {
    for (var a = [], c, f = 0, g = this.length;f < g;f++) {
      c = !0;
      var h = this[f], k;
      for (k in b) {
        if (b[k] != h[k]) {
          c = !1;
          break;
        }
      }
      c && a.push(h);
    }
    return a;
  };
  a.pop = function() {
    var a = b.pop.call(this);
    delete this._hashMap[a.id];
    return a;
  };
  a.shift = function() {
    var a = b.shift.call(this);
    delete this._hashMap[a.id];
    return a;
  };
  a.slice = function(a, d) {
    a = b.slice.call(this, a, d);
    d = this._hashMap;
    for (var c in a) {
      delete d[a[c].id];
    }
    return a;
  };
  a.remove = function(b) {
    var a = this.indexOf(b);
    -1 < a && (delete this._hashMap[b.id], this.splice(a, 1));
  };
  a.splice = function(a, d) {
    var c = b.slice.call(arguments, 2), f = this._hashMap;
    d = void 0 === d ? this.length - a : d;
    for (var g = b.splice.call(this, a, d), h = 0, k = g.length;h < k;h++) {
      delete f[g[h].id];
    }
    h = 0;
    for (k = c.length;h < k;h++) {
      f = c[h], b.splice.call(this, a++, 0, f), this._hashMap[f.id] = f;
    }
    return g;
  };
  a.clear = function() {
    for (;this.length;) {
      b.pop.call(this);
    }
    this._hashMap = {};
  };
  a.map = function(b, a) {
    for (var c = [], d = 0, g = this.length;d < g;d++) {
      c.push(b(this[d], a));
    }
    return c;
  };
  a.moveFromTo = function(a, d) {
    var c = this.length - 1;
    0 > a || 0 > d || a > c || d > c || b.splice.call(this, d, 0, b.splice.call(this, a, 1)[0]);
  };
  a.sort = function() {
  };
  a.fromJSON = function() {
  };
  a.toJSON = function() {
    for (var b = [], a = 0, e = this.length;a < e;a++) {
      b.push(this[a].toJSON());
    }
    return b;
  };
  a.observe = function() {
  };
  a.unobserve = function() {
  };
  a.notify = function() {
  };
  a.destroy = function() {
  };
})(Entry.Collection.prototype, Array.prototype);
Entry.Event = function(a) {
  this._sender = a;
  this._listeners = [];
};
(function(a) {
  a.attach = function(b, a) {
    var c = this;
    b = {obj:b, fn:a, destroy:function() {
      c.detach(this);
    }};
    this._listeners.push(b);
    return b;
  };
  a.detach = function(b) {
    var a = this._listeners;
    b = a.indexOf(b);
    if (-1 < b) {
      return a.splice(b, 1);
    }
  };
  a.clear = function() {
    for (var b = this._listeners;b.length;) {
      b.pop();
    }
  };
  a.notify = function() {
    var b = arguments;
    this._listeners.slice().forEach(function(a) {
      a.fn.apply(a.obj, b);
    });
  };
})(Entry.Event.prototype);
Entry.Utils = {};
Entry.overridePrototype = function() {
  Number.prototype.mod = function(a) {
    return (this % a + a) % a;
  };
};
Entry.Utils.generateId = function() {
  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
};
Entry.Utils.intersectArray = function(a, b) {
  for (var c = [], d = 0;d < a.length;d++) {
    for (var e = 0;e < b.length;e++) {
      if (a[d] == b[e]) {
        c.push(a[d]);
        break;
      }
    }
  }
  return c;
};
Entry.Utils.isPointInMatrix = function(a, b, c) {
  c = void 0 === c ? 0 : c;
  var d = a.offsetX ? a.x + a.offsetX : a.x, e = a.offsetY ? a.y + a.offsety : a.y;
  return d - c <= b.x && d + a.width + c >= b.x && e - c <= b.y && e + a.height + c >= b.y;
};
Entry.Utils.colorDarken = function(a, b) {
  function c(b) {
    2 != b.length && (b = "0" + b);
    return b;
  }
  var d, e;
  7 === a.length ? (d = parseInt(a.substr(1, 2), 16), e = parseInt(a.substr(3, 2), 16), a = parseInt(a.substr(5, 2), 16)) : (d = parseInt(a.substr(1, 2), 16), e = parseInt(a.substr(2, 2), 16), a = parseInt(a.substr(3, 2), 16));
  b = void 0 === b ? .7 : b;
  d = c(Math.floor(d * b).toString(16));
  e = c(Math.floor(e * b).toString(16));
  a = c(Math.floor(a * b).toString(16));
  return "#" + d + e + a;
};
Entry.Utils.colorLighten = function(a, b) {
  b = 0 === b ? 0 : b || 20;
  a = Entry.Utils.hexToHsl(a);
  a.l += b / 100;
  a.l = Math.min(1, Math.max(0, a.l));
  return Entry.Utils.hslToHex(a);
};
Entry.Utils.bound01 = function(a, b) {
  var c = a;
  "string" == typeof c && -1 != c.indexOf(".") && 1 === parseFloat(c) && (a = "100%");
  c = "string" === typeof a && -1 != a.indexOf("%");
  a = Math.min(b, Math.max(0, parseFloat(a)));
  c && (a = parseInt(a * b, 10) / 100);
  return 1E-6 > Math.abs(a - b) ? 1 : a % b / parseFloat(b);
};
Entry.Utils.hexToHsl = function(a) {
  var b, c;
  7 === a.length ? (b = parseInt(a.substr(1, 2), 16), c = parseInt(a.substr(3, 2), 16), a = parseInt(a.substr(5, 2), 16)) : (b = parseInt(a.substr(1, 2), 16), c = parseInt(a.substr(2, 2), 16), a = parseInt(a.substr(3, 2), 16));
  b = Entry.Utils.bound01(b, 255);
  c = Entry.Utils.bound01(c, 255);
  a = Entry.Utils.bound01(a, 255);
  var d = Math.max(b, c, a), e = Math.min(b, c, a), f, g = (d + e) / 2;
  if (d == e) {
    f = e = 0;
  } else {
    var h = d - e, e = .5 < g ? h / (2 - d - e) : h / (d + e);
    switch(d) {
      case b:
        f = (c - a) / h + (c < a ? 6 : 0);
        break;
      case c:
        f = (a - b) / h + 2;
        break;
      case a:
        f = (b - c) / h + 4;
    }
    f /= 6;
  }
  return {h:360 * f, s:e, l:g};
};
Entry.Utils.hslToHex = function(a) {
  function b(b, a, c) {
    0 > c && (c += 1);
    1 < c && --c;
    return c < 1 / 6 ? b + 6 * (a - b) * c : .5 > c ? a : c < 2 / 3 ? b + (a - b) * (2 / 3 - c) * 6 : b;
  }
  function c(b) {
    return 1 == b.length ? "0" + b : "" + b;
  }
  var d, e;
  e = Entry.Utils.bound01(a.h, 360);
  d = Entry.Utils.bound01(a.s, 1);
  a = Entry.Utils.bound01(a.l, 1);
  if (0 === d) {
    d = a = e = a;
  } else {
    var f = .5 > a ? a * (1 + d) : a + d - a * d, g = 2 * a - f;
    d = b(g, f, e + 1 / 3);
    a = b(g, f, e);
    e = b(g, f, e - 1 / 3);
  }
  a *= 255;
  e *= 255;
  return "#" + [c(Math.round(255 * d).toString(16)), c(Math.round(a).toString(16)), c(Math.round(e).toString(16))].join("");
};
Entry.Utils.bindGlobalEvent = function(a) {
  var b = $(document);
  void 0 === a && (a = "resize mousedown mousemove keydown keyup dispose".split(" "));
  -1 < a.indexOf("resize") && (Entry.windowReszied && ($(window).off("resize"), Entry.windowReszied.clear()), Entry.windowResized = new Entry.Event(window), $(window).on("resize", function(b) {
    Entry.windowResized.notify(b);
  }));
  -1 < a.indexOf("mousedown") && (Entry.documentMousedown && (b.off("mousedown"), Entry.documentMousedown.clear()), Entry.documentMousedown = new Entry.Event(window), b.on("mousedown", function(b) {
    Entry.documentMousedown.notify(b);
  }));
  -1 < a.indexOf("mousemove") && (Entry.documentMousemove && (b.off("touchmove mousemove"), Entry.documentMousemove.clear()), Entry.mouseCoordinate = {}, Entry.documentMousemove = new Entry.Event(window), b.on("touchmove mousemove", function(b) {
    b.originalEvent && b.originalEvent.touches && (b = b.originalEvent.touches[0]);
    Entry.documentMousemove.notify(b);
    Entry.mouseCoordinate.x = b.clientX;
    Entry.mouseCoordinate.y = b.clientY;
  }));
  -1 < a.indexOf("keydown") && (Entry.keyPressed && (b.off("keydown"), Entry.keyPressed.clear()), Entry.pressedKeys = [], Entry.keyPressed = new Entry.Event(window), b.on("keydown", function(b) {
    var a = b.keyCode;
    0 > Entry.pressedKeys.indexOf(a) && Entry.pressedKeys.push(a);
    Entry.keyPressed.notify(b);
  }));
  -1 < a.indexOf("keyup") && (Entry.keyUpped && (b.off("keyup"), Entry.keyUpped.clear()), Entry.keyUpped = new Entry.Event(window), b.on("keyup", function(b) {
    var a = Entry.pressedKeys.indexOf(b.keyCode);
    -1 < a && Entry.pressedKeys.splice(a, 1);
    Entry.keyUpped.notify(b);
  }));
  -1 < a.indexOf("dispose") && (Entry.disposeEvent && Entry.disposeEvent.clear(), Entry.disposeEvent = new Entry.Event(window), Entry.documentMousedown && Entry.documentMousedown.attach(this, function(b) {
    Entry.disposeEvent.notify(b);
  }));
};
Entry.Utils.makeActivityReporter = function() {
  Entry.activityReporter = new Entry.ActivityReporter;
  Entry.commander && Entry.commander.addReporter(Entry.activityReporter);
  return Entry.activityReporter;
};
Entry.Utils.initEntryEvent_ = function() {
  Entry.events_ || (Entry.events_ = []);
};
Entry.sampleColours = [];
Entry.assert = function(a, b) {
  if (!a) {
    throw Error(b || "Assert failed");
  }
};
Entry.parseTexttoXML = function(a) {
  var b;
  window.ActiveXObject ? (b = new ActiveXObject("Microsoft.XMLDOM"), b.async = "false", b.loadXML(a)) : b = (new DOMParser).parseFromString(a, "text/xml");
  return b;
};
Entry.createElement = function(a, b) {
  a = a instanceof HTMLElement ? a : document.createElement(a);
  b && (a.id = b);
  a.hasClass = function(b) {
    return this.className.match(new RegExp("(\\s|^)" + b + "(\\s|$)"));
  };
  a.addClass = function(b) {
    for (var a = 0;a < arguments.length;a++) {
      b = arguments[a], this.hasClass(b) || (this.className += " " + b);
    }
  };
  a.removeClass = function(b) {
    for (var a = 0;a < arguments.length;a++) {
      b = arguments[a], this.hasClass(b) && (this.className = this.className.replace(new RegExp("(\\s|^)" + b + "(\\s|$)"), " "));
    }
  };
  a.bindOnClick = function(b) {
    $(this).on("click tab", function(a) {
      a.stopImmediatePropagation();
      b.call(this, a);
    });
  };
  return a;
};
Entry.makeAutolink = function(a) {
  return a ? a.replace(/(http|https|ftp|telnet|news|irc):\/\/([-/.a-zA-Z0-9_~#%$?&=:200-377()][^)\]}]+)/gi, "<a href='$1://$2' target='_blank'>$1://$2</a>").replace(/([xA1-xFEa-z0-9_-]+@[xA1-xFEa-z0-9-]+.[a-z0-9-]+)/gi, "<a href='mailto:$1'>$1</a>") : "";
};
Entry.generateHash = function() {
  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
};
Entry.addEventListener = function(a, b) {
  this.events_ || (this.events_ = {});
  this.events_[a] || (this.events_[a] = []);
  b instanceof Function && this.events_[a].push(b);
  return !0;
};
Entry.dispatchEvent = function(a, b) {
  this.events_ || (this.events_ = {});
  if (this.events_[a]) {
    for (var c = 0, d = this.events_[a].length;c < d;c++) {
      this.events_[a][c].call(window, b);
    }
  }
};
Entry.removeEventListener = function(a, b) {
  if (this.events_[a]) {
    for (var c = 0, d = this.events_[a].length;c < d;c++) {
      if (this.events_[a][c] === b) {
        this.events_[a].splice(c, 1);
        break;
      }
    }
  }
};
Entry.removeAllEventListener = function(a) {
  this.events_ && this.events_[a] && delete this.events_[a];
};
Entry.addTwoNumber = function(a, b) {
  if (isNaN(a) || isNaN(b)) {
    return a + b;
  }
  a += "";
  b += "";
  var c = a.indexOf("."), d = b.indexOf("."), e = 0, f = 0;
  0 < c && (e = a.length - c - 1);
  0 < d && (f = b.length - d - 1);
  return 0 < e || 0 < f ? e >= f ? (parseFloat(a) + parseFloat(b)).toFixed(e) : (parseFloat(a) + parseFloat(b)).toFixed(f) : parseInt(a) + parseInt(b);
};
Entry.hex2rgb = function(a) {
  return (a = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a)) ? {r:parseInt(a[1], 16), g:parseInt(a[2], 16), b:parseInt(a[3], 16)} : null;
};
Entry.rgb2hex = function(a, b, c) {
  return "#" + (16777216 + (a << 16) + (b << 8) + c).toString(16).slice(1);
};
Entry.generateRgb = function() {
  return {r:Math.floor(256 * Math.random()), g:Math.floor(256 * Math.random()), b:Math.floor(256 * Math.random())};
};
Entry.adjustValueWithMaxMin = function(a, b, c) {
  return a > c ? c : a < b ? b : a;
};
Entry.isExist = function(a, b, c) {
  for (var d = 0;d < c.length;d++) {
    if (c[d][b] == a) {
      return c[d];
    }
  }
  return !1;
};
Entry.getColourCodes = function() {
  return "transparent #660000 #663300 #996633 #003300 #003333 #003399 #000066 #330066 #660066 #FFFFFF #990000 #993300 #CC9900 #006600 #336666 #0033FF #000099 #660099 #990066 #000000 #CC0000 #CC3300 #FFCC00 #009900 #006666 #0066FF #0000CC #663399 #CC0099 #333333 #FF0000 #FF3300 #FFFF00 #00CC00 #009999 #0099FF #0000FF #9900CC #FF0099 #666666 #CC3333 #FF6600 #FFFF33 #00FF00 #00CCCC #00CCFF #3366FF #9933FF #FF00FF #999999 #FF6666 #FF6633 #FFFF66 #66FF66 #66CCCC #00FFFF #3399FF #9966FF #FF66FF #BBBBBB #FF9999 #FF9966 #FFFF99 #99FF99 #66FFCC #99FFFF #66CCff #9999FF #FF99FF #CCCCCC #FFCCCC #FFCC99 #FFFFCC #CCFFCC #99FFCC #CCFFFF #99CCFF #CCCCFF #FFCCFF".split(" ");
};
Entry.removeElement = function(a) {
  a && a.parentNode && a.parentNode.removeChild(a);
};
Entry.getElementsByClassName = function(a) {
  for (var b = [], c = document.getElementsByTagName("*"), d = 0;d < c.length;d++) {
    -1 < (" " + c[d].className + " ").indexOf(" " + a + " ") && b.push(c[d]);
  }
  return b;
};
Entry.parseNumber = function(a) {
  return "string" != typeof a || isNaN(Number(a)) ? "number" != typeof a || isNaN(Number(a)) ? !1 : a : Number(a);
};
Entry.countStringLength = function(a) {
  var b, c = 0;
  for (b = 0;b < a.length;b++) {
    255 < a.charCodeAt(b) ? c += 2 : c++;
  }
  return c;
};
Entry.cutStringByLength = function(a, b) {
  var c, d = 0;
  for (c = 0;d < b && c < a.length;c++) {
    255 < a.charCodeAt(c) ? d += 2 : d++;
  }
  return a.substr(0, c);
};
Entry.isChild = function(a, b) {
  if (!b) {
    for (;b.parentNode;) {
      if ((b = b.parentNode) == a) {
        return !0;
      }
    }
  }
  return !1;
};
Entry.launchFullScreen = function(a) {
  a.requestFullscreen ? a.requestFullscreen() : a.mozRequestFulScreen ? a.mozRequestFulScreen() : a.webkitRequestFullscreen ? a.webkitRequestFullscreen() : a.msRequestFullScreen && a.msRequestFullScreen();
};
Entry.exitFullScreen = function() {
  document.exitFullScreen ? document.exitFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen && document.webkitExitFullscreen();
};
Entry.isPhone = function() {
  return !1;
};
Entry.getKeyCodeMap = function() {
  return {65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n", 79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 90:"z", 32:Lang.Blocks.START_press_some_key_space, 37:Lang.Blocks.START_press_some_key_left, 38:Lang.Blocks.START_press_some_key_up, 39:Lang.Blocks.START_press_some_key_right, 40:Lang.Blocks.START_press_some_key_down, 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 
  13:Lang.Blocks.START_press_some_key_enter};
};
Entry.checkCollisionRect = function(a, b) {
  return !(a.y + a.height < b.y || a.y > b.y + b.height || a.x + a.width < b.x || a.x > b.x + b.width);
};
Entry.bindAnimationCallback = function(a, b) {
  a.addEventListener("webkitAnimationEnd", b, !1);
  a.addEventListener("animationend", b, !1);
  a.addEventListener("oanimationend", b, !1);
};
Entry.cloneSimpleObject = function(a) {
  var b = {}, c;
  for (c in a) {
    b[c] = a[c];
  }
  return b;
};
Entry.nodeListToArray = function(a) {
  for (var b = Array(a.length), c = -1, d = a.length;++c !== d;b[c] = a[c]) {
  }
  return b;
};
Entry.computeInputWidth = function(a) {
  var b = document.createElement("span");
  b.className = "tmp-element";
  b.innerHTML = a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  document.body.appendChild(b);
  a = b.offsetWidth;
  document.body.removeChild(b);
  return Number(a + 10) + "px";
};
Entry.isArrowOrBackspace = function(a) {
  return -1 < [37, 38, 39, 40, 8].indexOf(a);
};
Entry.hexStringToBin = function(a) {
  for (var b = [], c = 0;c < a.length - 1;c += 2) {
    b.push(parseInt(a.substr(c, 2), 16));
  }
  return String.fromCharCode.apply(String, b);
};
Entry.findObjsByKey = function(a, b, c) {
  for (var d = [], e = 0;e < a.length;e++) {
    a[e][b] == c && d.push(a[e]);
  }
  return d;
};
Entry.factorials = [];
Entry.factorial = function(a) {
  return 0 === a || 1 == a ? 1 : 0 < Entry.factorials[a] ? Entry.factorials[a] : Entry.factorials[a] = Entry.factorial(a - 1) * a;
};
Entry.getListRealIndex = function(a, b) {
  if (isNaN(a)) {
    switch(a) {
      case "FIRST":
        a = 1;
        break;
      case "LAST":
        a = b.array_.length;
        break;
      case "RANDOM":
        a = Math.floor(Math.random() * b.array_.length) + 1;
    }
  }
  return a;
};
Entry.toRadian = function(a) {
  return a * Math.PI / 180;
};
Entry.toDegrees = function(a) {
  return 180 * a / Math.PI;
};
Entry.getPicturesJSON = function(a) {
  for (var b = [], c = 0, d = a.length;c < d;c++) {
    var e = a[c], f = {};
    f._id = e._id;
    f.id = e.id;
    f.dimension = e.dimension;
    f.filename = e.filename;
    f.fileurl = e.fileurl;
    f.name = e.name;
    f.scale = e.scale;
    b.push(f);
  }
  return b;
};
Entry.getSoundsJSON = function(a) {
  for (var b = [], c = 0, d = a.length;c < d;c++) {
    var e = a[c], f = {};
    f._id = e._id;
    f.duration = e.duration;
    f.ext = e.ext;
    f.id = e.id;
    f.filename = e.filename;
    f.fileurl = e.fileurl;
    f.name = e.name;
    b.push(f);
  }
  return b;
};
Entry.cutDecimal = function(a) {
  return Math.round(100 * a) / 100;
};
Entry.getBrowserType = function() {
  if (Entry.userAgent) {
    return Entry.userAgent;
  }
  var a = navigator.userAgent, b, c = a.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(c[1])) {
    return b = /\brv[ :]+(\d+)/g.exec(a) || [], "IE " + (b[1] || "");
  }
  if ("Chrome" === c[1] && (b = a.match(/\b(OPR|Edge)\/(\d+)/), null != b)) {
    return b.slice(1).join(" ").replace("OPR", "Opera");
  }
  c = c[2] ? [c[1], c[2]] : [navigator.appName, navigator.appVersion, "-?"];
  null != (b = a.match(/version\/(\d+)/i)) && c.splice(1, 1, b[1]);
  a = c.join(" ");
  return Entry.userAgent = a;
};
Entry.setBasicBrush = function(a) {
  var b = new createjs.Graphics;
  b.thickness = 1;
  b.rgb = Entry.hex2rgb("#ff0000");
  b.opacity = 100;
  b.setStrokeStyle(1);
  b.beginStroke("rgba(255,0,0,1)");
  var c = new createjs.Shape(b);
  Entry.stage.selectedObjectContainer.addChild(c);
  a.brush && (a.brush = null);
  a.brush = b;
  a.shape && (a.shape = null);
  a.shape = c;
};
Entry.setCloneBrush = function(a, b) {
  var c = new createjs.Graphics;
  c.thickness = b.thickness;
  c.rgb = b.rgb;
  c.opacity = b.opacity;
  c.setStrokeStyle(c.thickness);
  c.beginStroke("rgba(" + c.rgb.r + "," + c.rgb.g + "," + c.rgb.b + "," + c.opacity / 100 + ")");
  b = new createjs.Shape(c);
  Entry.stage.selectedObjectContainer.addChild(b);
  a.brush && (a.brush = null);
  a.brush = c;
  a.shape && (a.shape = null);
  a.shape = b;
};
Entry.isFloat = function(a) {
  return /\d+\.{1}\d+$/.test(a);
};
Entry.getStringIndex = function(a) {
  if (!a) {
    return "";
  }
  for (var b = {string:a, index:1}, c = 0, d = [], e = a.length - 1;0 < e;--e) {
    var f = a.charAt(e);
    if (isNaN(f)) {
      break;
    } else {
      d.unshift(f), c = e;
    }
  }
  0 < c && (b.string = a.substring(0, c), b.index = parseInt(d.join("")) + 1);
  return b;
};
Entry.getOrderedName = function(a, b, c) {
  if (!a) {
    return "untitled";
  }
  if (!b || 0 === b.length) {
    return a;
  }
  c || (c = "name");
  for (var d = 0, e = Entry.getStringIndex(a), f = 0, g = b.length;f < g;f++) {
    var h = Entry.getStringIndex(b[f][c]);
    e.string === h.string && h.index > d && (d = h.index);
  }
  return 0 < d ? e.string + d : a;
};
Entry.changeXmlHashId = function(a) {
  if (/function_field/.test(a.getAttribute("type"))) {
    for (var b = a.getElementsByTagName("mutation"), c = 0, d = b.length;c < d;c++) {
      b[c].setAttribute("hashid", Entry.generateHash());
    }
  }
  return a;
};
Entry.getMaxFloatPoint = function(a) {
  for (var b = 0, c = 0, d = a.length;c < d;c++) {
    var e = String(a[c]), f = e.indexOf(".");
    -1 !== f && (e = e.length - (f + 1), e > b && (b = e));
  }
  return Math.min(b, 20);
};
Entry.convertToRoundedDecimals = function(a, b) {
  return isNaN(a) || !this.isFloat(a) ? a : Number(Math.round(a + "e" + b) + "e-" + b);
};
Entry.attachEventListener = function(a, b, c) {
  setTimeout(function() {
    a.addEventListener(b, c);
  }, 0);
};
Entry.deAttachEventListener = function(a, b, c) {
  a.removeEventListener(b, c);
};
Entry.isEmpty = function(a) {
  if (!a) {
    return !0;
  }
  for (var b in a) {
    if (a.hasOwnProperty(b)) {
      return !1;
    }
  }
  return !0;
};
Entry.Utils.disableContextmenu = function(a) {
  if (a) {
    $(a).on("contextmenu", function(b) {
      b.stopPropagation();
      b.preventDefault();
      return !1;
    });
  }
};
Entry.Utils.isRightButton = function(a) {
  return 2 == a.button || a.ctrlKey;
};
Entry.Utils.isTouchEvent = function(a) {
  return "mousedown" !== a.type.toLowerCase();
};
Entry.Utils.inherit = function(a, b) {
  function c() {
  }
  c.prototype = a.prototype;
  b.prototype = new c;
  return b;
};
Entry.bindAnimationCallbackOnce = function(a, b) {
  a.one("webkitAnimationEnd animationendo animationend", b);
};
Entry.Utils.isInInput = function(a) {
  return "textarea" == a.target.type || "text" == a.target.type;
};
Entry.Utils.isFunction = function(a) {
  return "function" === typeof a;
};
Entry.Utils.addFilters = function(a, b) {
  a = a.elem("defs");
  var c = a.elem("filter", {id:"entryTrashcanFilter_" + b});
  c.elem("feGaussianBlur", {"in":"SourceAlpha", stdDeviation:2, result:"blur"});
  c.elem("feOffset", {"in":"blur", dx:1, dy:1, result:"offsetBlur"});
  c = c.elem("feMerge");
  c.elem("feMergeNode", {"in":"offsetBlur"});
  c.elem("feMergeNode", {"in":"SourceGraphic"}, c);
  c = a.elem("filter", {id:"entryBlockShadowFilter_" + b, height:"200%"});
  c.elem("feOffset", {result:"offOut", in:"SourceGraphic", dx:0, dy:1});
  c.elem("feColorMatrix", {result:"matrixOut", in:"offOut", type:"matrix", values:"0.7 0 0 0 0 0 0.7 0 0 0 0 0 0.7 0 0 0 0 0 1 0"});
  c.elem("feBlend", {in:"SourceGraphic", in1:"offOut", mode:"normal"});
  b = a.elem("filter", {id:"entryBlockHighlightFilter_" + b});
  b.elem("feOffset", {result:"offOut", in:"SourceGraphic", dx:0, dy:0});
  b.elem("feColorMatrix", {result:"matrixOut", in:"offOut", type:"matrix", values:"1.3 0 0 0 0 0 1.3 0 0 0 0 0 1.3 0 0 0 0 0 1 0"});
};
Entry.Utils.addBlockPattern = function(a, b) {
  a = a.elem("pattern", {id:"blockHoverPattern_" + b, class:"blockHoverPattern", patternUnits:"userSpaceOnUse", patternTransform:"translate(12, 0)", x:0, y:0, width:125, height:33, style:"display: none"});
  b = Entry.mediaFilePath + "block_pattern_(order).png";
  for (var c = 1;5 > c;c++) {
    a.elem("image", {class:"pattern" + c, href:b.replace("(order)", c), x:0, y:0, width:125, height:33});
  }
  return {pattern:a};
};
Entry.Utils.COLLISION = {NONE:0, UP:1, RIGHT:2, LEFT:3, DOWN:4};
Entry.Utils.createMouseEvent = function(a, b) {
  var c = document.createEvent("MouseEvent");
  c.initMouseEvent(a, !0, !0, window, 0, 0, 0, b.clientX, b.clientY, !1, !1, !1, !1, 0, null);
  return c;
};
Entry.Utils.xmlToJsonData = function(a) {
  a = $.parseXML(a);
  var b = [];
  a = a.childNodes[0].childNodes;
  for (var c in a) {
    var d = a[c];
    if (d.tagName) {
      var e = {category:d.getAttribute("id"), blocks:[]}, d = d.childNodes;
      for (c in d) {
        var f = d[c];
        f.tagName && (f = f.getAttribute("type")) && e.blocks.push(f);
      }
      b.push(e);
    }
  }
  return b;
};
Entry.Utils.stopProjectWithToast = function(a, b, c) {
  var d = a.block;
  b = b || "\ub7f0\ud0c0\uc784 \uc5d0\ub7ec \ubc1c\uc0dd";
  Entry.toast && !c && Entry.toast.alert(Lang.Msgs.warn, Lang.Workspace.check_runtime_error, !0);
  Entry.engine && Entry.engine.toggleStop();
  "workspace" === Entry.type && (a.block && "funcBlock" in a.block ? d = a.block.funcBlock : a.funcExecutor && (d = a.funcExecutor.scope.block, a = a.type.replace("func_", ""), Entry.Func.edit(Entry.variableContainer.functions_[a])), d && (Entry.container.selectObject(d.getCode().object.id, !0), d.view.getBoard().activateBlock(d)));
  throw Error(b);
};
Entry.Utils.AsyncError = function(a) {
  this.name = "AsyncError";
  this.message = a || "\ube44\ub3d9\uae30 \ud638\ucd9c \ub300\uae30";
};
Entry.Utils.AsyncError.prototype = Error();
Entry.Utils.AsyncError.prototype.constructor = Entry.Utils.AsyncError;
Entry.Utils.isChrome = function() {
  return /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
};
Entry.Utils.waitForWebfonts = function(a, b) {
  var c = 0;
  if (a && a.length) {
    for (var d = 0, e = a.length;d < e;++d) {
      (function(d) {
        function e() {
          f && f.offsetWidth != k && (++c, f.parentNode.removeChild(f), f = null);
          if (c >= a.length && (m && clearInterval(m), c == a.length)) {
            return b(), !0;
          }
        }
        var f = document.createElement("span");
        f.innerHTML = "giItT1WQy@!-/#";
        f.style.position = "absolute";
        f.style.left = "-10000px";
        f.style.top = "-10000px";
        f.style.fontSize = "300px";
        f.style.fontFamily = "sans-serif";
        f.style.fontVariant = "normal";
        f.style.fontStyle = "normal";
        f.style.fontWeight = "normal";
        f.style.letterSpacing = "0";
        document.body.appendChild(f);
        var k = f.offsetWidth;
        f.style.fontFamily = d;
        var m;
        e() || (m = setInterval(e, 50));
      })(a[d]);
    }
  } else {
    return b && b(), !0;
  }
};
window.requestAnimFrame = function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(a) {
    window.setTimeout(a, 1E3 / 60);
  };
}();
Entry.isMobile = function() {
  if (Entry.device) {
    return "tablet" === Entry.device;
  }
  var a = window.platform;
  if (a && a.type && ("tablet" === a.type || "mobile" === a.type)) {
    return Entry.device = "tablet", !0;
  }
  Entry.device = "desktop";
  return !1;
};
Entry.Utils.convertMouseEvent = function(a) {
  return a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
};
Entry.Utils.convertIntToHex = function(a) {
  return a.toString(16).toUpperCase();
};
Entry.Utils.hasSpecialCharacter = function(a) {
  return /!|@|#|\$|%|\^|&|\*|\(|\)|\+|=|-|\[|\]|\\|\'|;|,|\.|\/|{|}|\||\"|:|<|>|\?/g.test(a);
};
Entry.Utils.isNewVersion = function(a, b) {
  try {
    a = a.replace("v", "");
    b = b.replace("v", "");
    var c = a.split("."), d = b.split("."), e = c.length < d.length ? c.length : d.length;
    a = !1;
    b = !0;
    for (var f = 0;f < e;f++) {
      Number(c[f]) < Number(d[f]) ? (a = !0, b = !1) : Number(c[f]) > Number(d[f]) && (b = !1);
    }
    b && c.length < d.length && (a = !0);
    return a;
  } catch (g) {
    return !1;
  }
};
Entry.Model = function(a, b) {
  var c = Entry.Model;
  c.generateSchema(a);
  c.generateSetter(a);
  c.generateObserve(a);
  (void 0 === b || b) && Object.seal(a);
  return a;
};
(function(a) {
  a.generateSchema = function(b) {
    var a = b.schema;
    if (void 0 !== a) {
      a = JSON.parse(JSON.stringify(a));
      b.data = {};
      for (var d in a) {
        (function(c) {
          b.data[c] = a[c];
          Object.defineProperty(b, c, {get:function() {
            return b.data[c];
          }});
        })(d);
      }
      b._toJSON = this._toJSON;
    }
  };
  a.generateSetter = function(b) {
    b.set = this.set;
  };
  a.set = function(b, a) {
    var c = {}, e;
    for (e in this.data) {
      void 0 !== b[e] && (b[e] === this.data[e] ? delete b[e] : (c[e] = this.data[e], this.data[e] = b[e] instanceof Array ? b[e].concat() : b[e]));
    }
    a || this.notify(Object.keys(b), c);
  };
  a.generateObserve = function(b) {
    b.observers = [];
    b.observe = this.observe;
    b.unobserve = this.unobserve;
    b.notify = this.notify;
  };
  a.observe = function(b, a, d, e) {
    d = new Entry.Observer(this.observers, b, a, d);
    if (!1 !== e) {
      b[a]([]);
    }
    return d;
  };
  a.unobserve = function(b) {
    b.destroy();
  };
  a.notify = function(b, a) {
    "string" === typeof b && (b = [b]);
    var c = this;
    c.observers.map(function(d) {
      var e = b;
      void 0 !== d.attrs && (e = Entry.Utils.intersectArray(d.attrs, b));
      if (e.length) {
        d.object[d.funcName](e.map(function(b) {
          return {name:b, object:c, oldValue:a[b]};
        }));
      }
    });
  };
  a._toJSON = function() {
    var b = {}, a;
    for (a in this.data) {
      b[a] = this.data[a];
    }
    return b;
  };
})(Entry.Model);
Entry.Observer = function(a, b, c, d) {
  this.parent = a;
  this.object = b;
  this.funcName = c;
  this.attrs = d;
  a.push(this);
};
(function(a) {
  a.destroy = function() {
    var b = this.parent, a = b.indexOf(this);
    -1 < a && b.splice(a, 1);
    return this;
  };
})(Entry.Observer.prototype);
Entry.STATIC = {OBJECT:0, ENTITY:1, SPRITE:2, SOUND:3, VARIABLE:4, FUNCTION:5, SCENE:6, MESSAGE:7, BLOCK_MODEL:8, BLOCK_RENDER_MODEL:9, BOX_MODEL:10, THREAD_MODEL:11, DRAG_INSTANCE:12, BLOCK_STATIC:0, BLOCK_MOVE:1, BLOCK_FOLLOW:2, RETURN:0, CONTINUE:1, BREAK:2, PASS:3, COMMAND_TYPES:{addThread:101, destroyThread:102, destroyBlock:103, recoverBlock:104, insertBlock:105, separateBlock:106, moveBlock:107, cloneBlock:108, uncloneBlock:109, scrollBoard:110, setFieldValue:111, selectObject:201, "do":301, 
undo:302, redo:303, editPicture:401, uneditPicture:402, processPicture:403, unprocessPicture:404}};
Entry.Command = {};
(function(a) {
  a.do = {type:Entry.STATIC.COMMAND_TYPES["do"], log:function(b) {
    return [a["do"].type];
  }};
  a.undo = {type:Entry.STATIC.COMMAND_TYPES.undo, log:function(b) {
    return [a.undo.type];
  }};
  a.redo = {type:Entry.STATIC.COMMAND_TYPES.redo, log:function(b) {
    return [a.redo.type];
  }};
})(Entry.Command);
Entry.Commander = function(a) {
  if ("workspace" == a || "phone" == a) {
    Entry.stateManager = new Entry.StateManager;
  }
  Entry.do = this.do.bind(this);
  Entry.undo = this.undo.bind(this);
  this.editor = {};
  this.reporters = [];
  this._tempStorage = null;
  Entry.Command.editor = this.editor;
};
(function(a) {
  a.do = function(b) {
    var a = this, d = Array.prototype.slice.call(arguments);
    d.shift();
    var e = Entry.Command[b];
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [b, this, this.do, e.undo].concat(e.state.apply(this, d)));
    e = Entry.Command[b].do.apply(this, d);
    setTimeout(function() {
      a.report("do");
      a.report(b, d);
    }, 0);
    return {value:e, isPass:this.isPass.bind(this)};
  };
  a.undo = function() {
    var b = Array.prototype.slice.call(arguments), a = b.shift(), d = Entry.Command[a];
    this.report("undo");
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [a, this, this.do, d.undo].concat(d.state.apply(this, b)));
    return {value:Entry.Command[a].do.apply(this, b), isPass:this.isPass.bind(this)};
  };
  a.redo = function() {
    var b = Array.prototype.slice.call(arguments), a = b.shift(), d = Entry.Command[a];
    that.report("redo");
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [a, this, this.undo, a].concat(d.state.apply(null, b)));
    d.undo.apply(this, b);
  };
  a.setCurrentEditor = function(b, a) {
    this.editor[b] = a;
  };
  a.isPass = function(b) {
    b = void 0 === b ? !0 : b;
    if (Entry.stateManager) {
      var a = Entry.stateManager.getLastCommand();
      a && (a.isPass = b);
    }
  };
  a.addReporter = function(b) {
    this.reporters.push(b);
  };
  a.removeReporter = function(b) {
    b = this.reporters.indexOf(b);
    -1 < b && this.reporters.splice(b, 1);
  };
  a.report = function(b, a) {
    var c = this.reporters;
    if (0 !== c.length) {
      var e;
      e = b && Entry.Command[b] && Entry.Command[b].log ? Entry.Command[b].log.apply(this, a) : a;
      c.forEach(function(b) {
        b.add(e);
      });
    }
  };
})(Entry.Commander.prototype);
(function(a) {
  a.addThread = {type:Entry.STATIC.COMMAND_TYPES.addThread, do:function(b) {
    return this.editor.board.code.createThread(b);
  }, state:function(b) {
    b.length && (b[0].id = Entry.Utils.generateId());
    return [b];
  }, log:function(b) {
    b = this.editor.board.code.getThreads().pop();
    return [a.addThread.type, ["thread", b.stringify()], ["code", this.editor.board.code.stringify()]];
  }, undo:"destroyThread"};
  a.destroyThread = {type:Entry.STATIC.COMMAND_TYPES.destroyThread, do:function(b) {
    this.editor.board.findById(b[0].id).destroy(!0, !0);
  }, state:function(b) {
    return [this.editor.board.findById(b[0].id).thread.toJSON()];
  }, log:function(b) {
    b = b[0].id;
    this.editor.board.findById(b);
    return [a.destroyThread.type, ["blockId", b], ["code", this.editor.board.code.stringify()]];
  }, undo:"addThread"};
  a.destroyBlock = {type:Entry.STATIC.COMMAND_TYPES.destroyBlock, do:function(b) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    b.doDestroy(!0);
  }, state:function(b) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    return [b.toJSON(), b.pointer()];
  }, log:function(b) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    return [a.destroyBlock.type, ["blockId", b.id], ["code", this.editor.board.code.stringify()]];
  }, undo:"recoverBlock"};
  a.recoverBlock = {type:Entry.STATIC.COMMAND_TYPES.recoverBlock, do:function(b, a) {
    b = this.editor.board.code.createThread([b]).getFirstBlock();
    "string" === typeof b && (b = this.editor.board.findById(b));
    this.editor.board.insert(b, a);
  }, state:function(b) {
    "string" !== typeof b && (b = b.id);
    return [b];
  }, log:function(b, c) {
    b = this.editor.board.findById(b.id);
    return [a.recoverBlock.type, ["block", b.stringify()], ["pointer", c], ["code", this.editor.board.code.stringify()]];
  }, undo:"destroyBlock"};
  a.insertBlock = {type:Entry.STATIC.COMMAND_TYPES.insertBlock, do:function(b, a, d) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    this.editor.board.insert(b, a, d);
  }, state:function(b, a) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    a = [b.id];
    var c = b.targetPointer();
    a.push(c);
    "string" !== typeof b && "basic" === b.getBlockType() && a.push(b.thread.getCount(b));
    return a;
  }, log:function(b, c, d) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    return [a.insertBlock.type, ["blockId", b.id], ["targetPointer", b.targetPointer()], ["count", d], ["code", this.editor.board.code.stringify()]];
  }, undo:"insertBlock"};
  a.separateBlock = {type:Entry.STATIC.COMMAND_TYPES.separateBlock, do:function(b) {
    b.view && b.view._toGlobalCoordinate(Entry.DRAG_MODE_DRAG);
    b.doSeparate();
  }, state:function(b) {
    var a = [b.id], d = b.targetPointer();
    a.push(d);
    "basic" === b.getBlockType() && a.push(b.thread.getCount(b));
    return a;
  }, log:function(b) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    return [a.separateBlock.type, ["blockId", b.id], ["x", b.x], ["y", b.y], ["code", this.editor.board.code.stringify()]];
  }, undo:"insertBlock"};
  a.moveBlock = {type:Entry.STATIC.COMMAND_TYPES.moveBlock, do:function(b, a, d) {
    void 0 !== a ? (b = this.editor.board.findById(b), b.moveTo(a, d)) : b._updatePos();
  }, state:function(b) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    return [b.id, b.x, b.y];
  }, log:function(b, c, d) {
    return [a.moveBlock.type, ["blockId", b.id], ["x", b.x], ["y", b.y], ["code", this.editor.board.code.stringify()]];
  }, undo:"moveBlock"};
  a.cloneBlock = {type:Entry.STATIC.COMMAND_TYPES.cloneBlock, do:function(b) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    this.editor.board.code.createThread(b.copy());
  }, state:function(b) {
    "string" !== typeof b && (b = b.id);
    return [b];
  }, log:function(b) {
    "string" === typeof b && (b = this.editor.board.findById(b));
    var c = this.editor.board.code.getThreads().pop();
    return [a.cloneBlock.type, ["blockId", b.id], ["thread", c.stringify()], ["code", this.editor.board.code.stringify()]];
  }, undo:"uncloneBlock"};
  a.uncloneBlock = {type:Entry.STATIC.COMMAND_TYPES.uncloneBlock, do:function(b) {
    b = this.editor.board.code.getThreads().pop().getFirstBlock();
    this._tempStorage = b.id;
    b.destroy(!0, !0);
  }, state:function(b) {
    return [b];
  }, log:function(b) {
    b = this._tempStorage;
    this._tempStorage = null;
    return [a.uncloneBlock.type, ["blockId", b], ["code", this.editor.board.code.stringify()]];
  }, undo:"cloneBlock"};
  a.scrollBoard = {type:Entry.STATIC.COMMAND_TYPES.scrollBoard, do:function(b, a, d) {
    d || this.editor.board.scroller._scroll(b, a);
    delete this.editor.board.scroller._diffs;
  }, state:function(b, a) {
    return [-b, -a];
  }, log:function(b, c) {
    return [a.scrollBoard.type, ["dx", b], ["dy", c]];
  }, undo:"scrollBoard"};
  a.setFieldValue = {type:Entry.STATIC.COMMAND_TYPES.setFieldValue, do:function(b, a, d, e, f) {
    a.setValue(f, !0);
  }, state:function(b, a, d, e, f) {
    return [b, a, d, f, e];
  }, log:function(b, c, d, e, f) {
    return [a.setFieldValue.type, ["pointer", d], ["newValue", f], ["code", this.editor.board.code.stringify()]];
  }, undo:"setFieldValue"};
})(Entry.Command);
(function(a) {
  a.selectObject = {type:Entry.STATIC.COMMAND_TYPES.selectObject, do:function(b) {
    return Entry.container.selectObject(b);
  }, state:function(b) {
    if ((b = Entry.playground) && b.object) {
      return [b.object.id];
    }
  }, log:function(b) {
    return [b];
  }, undo:"selectObject"};
})(Entry.Command);
(function(a) {
  a.editPicture = {type:Entry.STATIC.COMMAND_TYPES.editPicture, do:function(b, a) {
    Entry.playground.painter.lc.canRedo() && Entry.playground.painter.lc.redo();
  }, state:function(b) {
  }, log:function(b) {
    return [b];
  }, undo:"uneditPicture"};
  a.uneditPicture = {type:Entry.STATIC.COMMAND_TYPES.uneditPicture, do:function(b, a) {
    Entry.playground.painter.lc.undo();
  }, state:function(b) {
  }, log:function(b) {
    return [b];
  }, undo:"editPicture"};
  a.processPicture = {type:Entry.STATIC.COMMAND_TYPES.processPicture, do:function(b, a) {
    Entry.playground.painter.lc.canRedo() && Entry.playground.painter.lc.redo();
  }, state:function(b) {
  }, log:function(b) {
    return [b];
  }, undo:"unprocessPicture", isPass:!0};
  a.unprocessPicture = {type:Entry.STATIC.COMMAND_TYPES.unprocessPicture, do:function(b, a) {
    Entry.playground.painter.lc.undo();
  }, state:function(b) {
  }, log:function(b) {
    return [b];
  }, undo:"processPicture", isPass:!0};
})(Entry.Command);
Entry.Container = function() {
  this.objects_ = [];
  this.cachedPicture = {};
  this.inputValue = {};
  this.currentObjects_ = this.copiedObject = null;
  this._extensionObjects = [];
};
Entry.Container.prototype.generateView = function(a, b) {
  var c = this;
  this._view = a;
  this._view.addClass("entryContainer");
  this._view.addClass("entryContainerWorkspace");
  this._view.setAttribute("id", "entryContainerWorkspaceId");
  a = Entry.createElement("div");
  a.addClass("entryAddObjectWorkspace");
  a.innerHTML = Lang.Workspace.add_object;
  a.bindOnClick(function(b) {
    Entry.dispatchEvent("openSpriteManager");
  });
  a = Entry.createElement("div");
  b = "entryContainerListWorkspaceWrapper";
  Entry.isForLecture && (b += " lecture");
  a.addClass(b);
  Entry.Utils.disableContextmenu(a);
  $(a).bind("mousedown touchstart", function(b) {
    function a(b) {
      l && 5 < Math.sqrt(Math.pow(b.pageX - l.x, 2) + Math.pow(b.pageY - l.y, 2)) && g && (clearTimeout(g), g = null);
    }
    function d(b) {
      b.stopPropagation();
      h.unbind(".container");
      g && (clearTimeout(g), g = null);
    }
    var g = null, h = $(document), k = b.type, m = !1;
    if (Entry.Utils.isRightButton(b)) {
      c._rightClick(b), m = !0;
    } else {
      var l = {x:b.clientX, y:b.clientY};
      "touchstart" !== k || m || (b.stopPropagation(), b = Entry.Utils.convertMouseEvent(b), g = setTimeout(function() {
        g && (g = null, c._rightClick(b));
      }, 1E3), h.bind("mousemove.container touchmove.container", a), h.bind("mouseup.container touchend.container", d));
    }
  });
  this._view.appendChild(a);
  b = Entry.createElement("ul");
  a.appendChild(b);
  this._extensionListView = Entry.Dom(b, {class:"entryContainerExtensions"});
  b = Entry.createElement("ul");
  b.addClass("entryContainerListWorkspace");
  a.appendChild(b);
  this.listView_ = b;
  this.enableSort();
};
Entry.Container.prototype.enableSort = function() {
  $ && $(this.listView_).sortable({start:function(a, b) {
    b.item.data("start_pos", b.item.index());
  }, stop:function(a, b) {
    a = b.item.data("start_pos");
    b = b.item.index();
    Entry.container.moveElement(a, b);
  }, axis:"y", cancel:"input.selectedEditingObject"});
};
Entry.Container.prototype.disableSort = function() {
  $ && $(this.listView_).sortable("destroy");
};
Entry.Container.prototype.updateListView = function() {
  if (this.listView_) {
    for (var a = this.listView_;a.hasChildNodes();) {
      a.removeChild(a.lastChild);
    }
    var b = this.getCurrentObjects(), c;
    for (c in b) {
      a.appendChild(b[c].view_);
    }
    Entry.stage.sortZorder();
  }
};
Entry.Container.prototype.setObjects = function(a) {
  for (var b in a) {
    var c = new Entry.EntryObject(a[b]);
    this.objects_.push(c);
    c.generateView();
    c.pictures.map(function(b) {
      Entry.playground.generatePictureElement(b);
    });
    c.sounds.map(function(b) {
      Entry.playground.generateSoundElement(b);
    });
  }
  this.updateObjectsOrder();
  this.updateListView();
  Entry.stage.sortZorder();
  Entry.variableContainer.updateViews();
  a = Entry.type;
  ("workspace" == a || "phone" == a) && (a = this.getCurrentObjects()[0]) && this.selectObject(a.id);
};
Entry.Container.prototype.getPictureElement = function(a, b) {
  if (a = this.getObject(b).getPicture(a)) {
    return a.view;
  }
  throw Error("No picture found");
};
Entry.Container.prototype.setPicture = function(a) {
  var b = this.getObject(a.objectId), c;
  for (c in b.pictures) {
    if (a.id === b.pictures[c].id) {
      var d = {};
      d.dimension = a.dimension;
      d.id = a.id;
      d.filename = a.filename;
      d.fileurl = a.fileurl;
      d.name = a.name;
      d.view = b.pictures[c].view;
      b.pictures[c] = d;
      return;
    }
  }
  throw Error("No picture found");
};
Entry.Container.prototype.selectPicture = function(a, b) {
  b = this.getObject(b);
  if (a = b.getPicture(a)) {
    return b.selectedPicture = a, b.entity.setImage(a), b.updateThumbnailView(), b.id;
  }
  throw Error("No picture found");
};
Entry.Container.prototype.addObject = function(a, b) {
  var c = new Entry.EntryObject(a);
  c.name = Entry.getOrderedName(c.name, this.objects_);
  Entry.stateManager && Entry.stateManager.addCommand("add object", this, this.removeObject, c);
  c.scene || (c.scene = Entry.scene.selectedScene);
  "number" == typeof b ? a.sprite.category && "background" == a.sprite.category.main ? (c.setLock(!0), this.objects_.push(c)) : this.objects_.splice(b, 0, c) : a.sprite.category && "background" == a.sprite.category.main ? this.objects_.push(c) : this.objects_.unshift(c);
  c.generateView();
  c.pictures.map(function(b) {
    Entry.playground.generatePictureElement(b);
  });
  c.sounds.map(function(b) {
    Entry.playground.generateSoundElement(b);
  });
  this.setCurrentObjects();
  this.updateObjectsOrder();
  this.updateListView();
  this.selectObject(c.id);
  Entry.variableContainer.updateViews();
  return new Entry.State(this, this.removeObject, c);
};
Entry.Container.prototype.addExtension = function(a) {
  this._extensionObjects.push(a);
  this._extensionListView.append(a.renderView());
};
Entry.Container.prototype.addCloneObject = function(a, b) {
  a = a.toJSON();
  var c = Entry.generateHash();
  Entry.variableContainer.addCloneLocalVariables({objectId:a.id, newObjectId:c, json:a});
  a.id = c;
  a.scene = b || Entry.scene.selectedScene;
  this.addObject(a);
};
Entry.Container.prototype.removeObject = function(a) {
  var b = this.objects_.indexOf(a), c = a.toJSON();
  Entry.stateManager && Entry.stateManager.addCommand("remove object", this, this.addObject, c, b);
  c = new Entry.State(this.addObject, c, b);
  a.destroy();
  this.objects_.splice(b, 1);
  this.setCurrentObjects();
  Entry.stage.sortZorder();
  b = this.getCurrentObjects();
  b.length ? this.selectObject(b[0].id) : (this.selectObject(), Entry.playground.flushPlayground());
  Entry.toast.success(Lang.Workspace.remove_object, a.name + " " + Lang.Workspace.remove_object_msg);
  Entry.variableContainer.removeLocalVariables(a.id);
  Entry.playground.reloadPlayground();
  return c;
};
Entry.Container.prototype.selectObject = function(a, b) {
  a = this.getObject(a);
  b && a && Entry.scene.selectScene(a.scene);
  this.mapObjectOnScene(function(b) {
    b.view_ && b.view_.removeClass("selectedObject");
    b.isSelected_ = !1;
  });
  a && (a.view_ && a.view_.addClass("selectedObject"), a.isSelected_ = !0);
  Entry.playground && Entry.playground.injectObject(a);
  "minimize" != Entry.type && Entry.engine.isState("stop") && Entry.stage.selectObject(a);
};
Entry.Container.prototype.getAllObjects = function() {
  return this.objects_;
};
Entry.Container.prototype.getObject = function(a) {
  !a && Entry.playground && Entry.playground.object && (a = Entry.playground.object.id);
  for (var b = this.objects_.length, c = 0;c < b;c++) {
    var d = this.objects_[c];
    if (d.id == a) {
      return d;
    }
  }
};
Entry.Container.prototype.getEntity = function(a) {
  if (a = this.getObject(a)) {
    return a.entity;
  }
  Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.object_not_found, !0);
};
Entry.Container.prototype.getVariable = function(a) {
  for (var b = 0;b < this.variables_.length;b++) {
    var c = this.variables_[b];
    if (c.getId() == a || c.getName() == a) {
      return c;
    }
  }
};
Entry.Container.prototype.moveElement = function(a, b, c) {
  var d;
  d = this.getCurrentObjects();
  a = this.getAllObjects().indexOf(d[a]);
  b = this.getAllObjects().indexOf(d[b]);
  !c && Entry.stateManager && Entry.stateManager.addCommand("reorder object", Entry.container, Entry.container.moveElement, b, a, !0);
  this.objects_.splice(b, 0, this.objects_.splice(a, 1)[0]);
  this.setCurrentObjects();
  Entry.container.updateListView();
  Entry.requestUpdate = !0;
  return new Entry.State(Entry.container, Entry.container.moveElement, b, a, !0);
};
Entry.Container.prototype.moveElementByBlock = function(a, b) {
  a = this.getCurrentObjects().splice(a, 1)[0];
  this.getCurrentObjects().splice(b, 0, a);
  Entry.stage.sortZorder();
  this.updateListView();
};
Entry.Container.prototype.getDropdownList = function(a, b) {
  var c = [];
  switch(a) {
    case "sprites":
      var d = this.getCurrentObjects(), e = d.length;
      for (a = 0;a < e;a++) {
        b = d[a], c.push([b.name, b.id]);
      }
      break;
    case "spritesWithMouse":
      d = this.getCurrentObjects();
      e = d.length;
      for (a = 0;a < e;a++) {
        b = d[a], c.push([b.name, b.id]);
      }
      c.push([Lang.Blocks.mouse_pointer, "mouse"]);
      break;
    case "spritesWithSelf":
      d = this.getCurrentObjects();
      e = d.length;
      for (a = 0;a < e;a++) {
        b = d[a], c.push([b.name, b.id]);
      }
      c.push([Lang.Blocks.self, "self"]);
      break;
    case "collision":
      c.push([Lang.Blocks.mouse_pointer, "mouse"]);
      d = this.getCurrentObjects();
      e = d.length;
      for (a = 0;a < e;a++) {
        b = d[a], c.push([b.name, b.id]);
      }
      c.push([Lang.Blocks.wall, "wall"]);
      c.push([Lang.Blocks.wall_up, "wall_up"]);
      c.push([Lang.Blocks.wall_down, "wall_down"]);
      c.push([Lang.Blocks.wall_right, "wall_right"]);
      c.push([Lang.Blocks.wall_left, "wall_left"]);
      break;
    case "pictures":
      b = Entry.playground.object || b;
      if (!b) {
        break;
      }
      b = b.pictures;
      for (a = 0;a < b.length;a++) {
        d = b[a], c.push([d.name, d.id]);
      }
      break;
    case "messages":
      b = Entry.variableContainer.messages_;
      for (a = 0;a < b.length;a++) {
        d = b[a], c.push([d.name, d.id]);
      }
      break;
    case "variables":
      b = Entry.variableContainer.variables_;
      for (a = 0;a < b.length;a++) {
        d = b[a], d.object_ && Entry.playground.object && d.object_ != Entry.playground.object.id || c.push([d.getName(), d.getId()]);
      }
      c && 0 !== c.length || c.push([Lang.Blocks.VARIABLE_variable, "null"]);
      break;
    case "lists":
      b = Entry.playground.object || b;
      d = Entry.variableContainer.lists_;
      for (a = 0;a < d.length;a++) {
        e = d[a], e.object_ && b && e.object_ != b.id || c.push([e.getName(), e.getId()]);
      }
      c && 0 !== c.length || c.push([Lang.Blocks.VARIABLE_list, "null"]);
      break;
    case "scenes":
      b = Entry.scene.scenes_;
      for (a = 0;a < b.length;a++) {
        d = b[a], c.push([d.name, d.id]);
      }
      break;
    case "sounds":
      b = Entry.playground.object || b;
      if (!b) {
        break;
      }
      b = b.sounds;
      for (a = 0;a < b.length;a++) {
        d = b[a], c.push([d.name, d.id]);
      }
      break;
    case "clone":
      c.push([Lang.Blocks.oneself, "self"]);
      e = this.objects_.length;
      for (a = 0;a < e;a++) {
        b = this.objects_[a], c.push([b.name, b.id]);
      }
      break;
    case "objectSequence":
      for (e = this.getCurrentObjects().length, a = 0;a < e;a++) {
        c.push([(a + 1).toString(), a.toString()]);
      }
  }
  c.length || (c = [[Lang.Blocks.no_target, "null"]]);
  return c;
};
Entry.Container.prototype.clearRunningState = function() {
  this.mapObject(function(a) {
    a.clearExecutor();
  });
};
Entry.Container.prototype.clearRunningStateOnScene = function() {
  this.mapObjectOnScene(function(a) {
    a.clearExecutor();
  });
};
Entry.Container.prototype.mapObject = function(a, b) {
  for (var c = this.objects_.length, d = [], e = 0;e < c;e++) {
    d.push(a(this.objects_[e], b));
  }
  return d;
};
Entry.Container.prototype.mapObjectOnScene = function(a, b) {
  for (var c = this.getCurrentObjects(), d = c.length, e = [], f = 0;f < this._extensionObjects.length;f++) {
    var g = this._extensionObjects[f];
    e.push(a(g, b));
  }
  for (f = 0;f < d;f++) {
    g = c[f], e.push(a(g, b));
  }
  return e;
};
Entry.Container.prototype.mapEntity = function(a, b) {
  for (var c = this.objects_.length, d = [], e = 0;e < c;e++) {
    d.push(a(this.objects_[e].entity, b));
  }
  return d;
};
Entry.Container.prototype.mapEntityOnScene = function(a, b) {
  for (var c = this.getCurrentObjects(), d = c.length, e = [], f = 0;f < d;f++) {
    e.push(a(c[f].entity, b));
  }
  return e;
};
Entry.Container.prototype.mapEntityIncludeClone = function(a, b) {
  for (var c = this.objects_, d = c.length, e = [], f = 0;f < d;f++) {
    var g = c[f], h = g.clonedEntities.length;
    e.push(a(g.entity, b));
    for (var k = 0;k < h;k++) {
      var m = g.clonedEntities[k];
      m && !m.isStamp && e.push(a(m, b));
    }
  }
  return e;
};
Entry.Container.prototype.mapEntityIncludeCloneOnScene = function(a, b) {
  for (var c = this.getCurrentObjects(), d = c.length, e = [], f = 0;f < this._extensionObjects.length;f++) {
    var g = this._extensionObjects[f];
    e.push(a(g.entity, b));
  }
  for (f = 0;f < d;f++) {
    var g = c[f], h = g.clonedEntities.length;
    e.push(a(g.entity, b));
    for (var k = 0;k < h;k++) {
      var m = g.clonedEntities[k];
      m && !m.isStamp && e.push(a(m, b));
    }
  }
  return e;
};
Entry.Container.prototype.getCachedPicture = function(a) {
  Entry.assert("string" == typeof a, "pictureId must be string");
  return this.cachedPicture[a];
};
Entry.Container.prototype.cachePicture = function(a, b) {
  this.cachedPicture[a] = b;
};
Entry.Container.prototype.toJSON = function() {
  for (var a = [], b = this.objects_.length, c = 0;c < b;c++) {
    a.push(this.objects_[c].toJSON());
  }
  return a;
};
Entry.Container.prototype.takeSequenceSnapshot = function() {
  for (var a = this.objects_.length, b = this.objects_, c = 0;c < a;c++) {
    b[c].index = c;
  }
};
Entry.Container.prototype.loadSequenceSnapshot = function() {
  for (var a = this.objects_.length, b = Array(a), c = 0;c < a;c++) {
    var d = this.objects_[c];
    b[d.index || c] = d;
    delete d.index;
  }
  this.objects_ = b;
  this.setCurrentObjects();
  Entry.stage.sortZorder();
  this.updateListView();
};
Entry.Container.prototype.getInputValue = function() {
  return this.inputValue.getValue();
};
Entry.Container.prototype.setInputValue = function(a) {
  this.inputValue.complete || (a ? this.inputValue.setValue(a) : this.inputValue.setValue(0), Entry.stage.hideInputField(), Entry.console && Entry.console.stopInput(a), this.inputValue.complete = !0);
};
Entry.Container.prototype.resetSceneDuringRun = function() {
  this.mapEntityOnScene(function(a) {
    a.loadSnapshot();
    a.object.filters = [];
    a.resetFilter();
    a.dialog && a.dialog.remove();
    a.shape && a.removeBrush();
  });
  this.clearRunningStateOnScene();
};
Entry.Container.prototype.setCopiedObject = function(a) {
  this.copiedObject = a;
};
Entry.Container.prototype.updateObjectsOrder = function() {
  for (var a = Entry.scene.getScenes(), b = [], c = 0;c < a.length;c++) {
    for (var d = this.getSceneObjects(a[c]), e = 0;e < d.length;e++) {
      b.push(d[e]);
    }
  }
  this.objects_ = b;
};
Entry.Container.prototype.getSceneObjects = function(a) {
  a = a || Entry.scene.selectedScene;
  for (var b = [], c = this.getAllObjects(), d = 0;d < c.length;d++) {
    a.id == c[d].scene.id && b.push(c[d]);
  }
  return b;
};
Entry.Container.prototype.setCurrentObjects = function() {
  this.currentObjects_ = this.getSceneObjects();
};
Entry.Container.prototype.getCurrentObjects = function() {
  var a = this.currentObjects_;
  a && 0 !== a.length || this.setCurrentObjects();
  return this.currentObjects_;
};
Entry.Container.prototype.getProjectWithJSON = function(a) {
  a.objects = Entry.container.toJSON();
  a.variables = Entry.variableContainer.getVariableJSON();
  a.messages = Entry.variableContainer.getMessageJSON();
  a.scenes = Entry.scene.toJSON();
  return a;
};
Entry.Container.prototype.blurAllInputs = function() {
  this.getSceneObjects().map(function(a) {
    a = a.view_.getElementsByTagName("input");
    for (var b = 0, c = a.length;b < c;b++) {
      a[b].blur();
    }
  });
};
Entry.Container.prototype.showProjectAnswer = function() {
  var a = this.inputValue;
  a && a.setVisible(!0);
};
Entry.Container.prototype.hideProjectAnswer = function(a) {
  if ((a = this.inputValue) && a.isVisible() && !Entry.engine.isState("run")) {
    for (var b = Entry.container.getAllObjects(), c = ["ask_and_wait", "get_canvas_input_value", "set_visible_answer"], d = 0, e = b.length;d < e;d++) {
      for (var f = b[d].script, g = 0;g < c.length;g++) {
        if (f.hasBlockType(c[g])) {
          return;
        }
      }
    }
    a.setVisible(!1);
  }
};
Entry.Container.prototype.getView = function() {
  return this._view;
};
Entry.Container.prototype.resize = function() {
};
Entry.Container.prototype._rightClick = function(a) {
  a.stopPropagation && a.stopPropagation();
  var b = [{text:Lang.Blocks.Paste_blocks, enable:!Entry.engine.isState("run") && !!Entry.container.copiedObject, callback:function() {
    Entry.container.copiedObject ? Entry.container.addCloneObject(Entry.container.copiedObject) : Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.object_not_found_for_paste);
  }}];
  Entry.ContextMenu.show(b, "workspace-contextmenu", {x:a.clientX, y:a.clientY});
};
Entry.Container.prototype.removeFuncBlocks = function(a) {
  this.objects_.forEach(function(b) {
    b.script.removeBlocksByType(a);
  });
};
Entry.Container.prototype.clear = function() {
  this.objects_.map(function(a) {
    a.destroy();
  });
  this.objects_ = [];
  this.selectObject();
  Entry.playground.flushPlayground();
};
Entry.db = {data:{}, typeMap:{}};
(function(a) {
  a.add = function(b) {
    this.data[b.id] = b;
    var a = b.type;
    void 0 === this.typeMap[a] && (this.typeMap[a] = {});
    this.typeMap[a][b.id] = b;
  };
  a.has = function(b) {
    return this.data.hasOwnProperty(b);
  };
  a.remove = function(b) {
    this.has(b) && (delete this.typeMap[this.data[b].type][b], delete this.data[b]);
  };
  a.get = function(b) {
    return this.data[b];
  };
  a.find = function() {
  };
  a.clear = function() {
    this.data = {};
    this.typeMap = {};
  };
})(Entry.db);
Entry.Dom = function(a, b) {
  var c = /<(\w+)>/, d;
  d = a instanceof HTMLElement ? $(a) : a instanceof jQuery ? a : c.test(a) ? $(a) : $("<" + a + "></" + a + ">");
  if (void 0 === b) {
    return d;
  }
  b.id && d.attr("id", b.id);
  b.class && d.addClass(b.class);
  b.classes && b.classes.map(function(b) {
    d.addClass(b);
  });
  b.src && d.attr("src", b.src);
  b.parent && b.parent.append(d);
  d.bindOnClick = function() {
    var b, a, c = function(b) {
      b.stopImmediatePropagation();
      b.handled || (b.handled = !0, a.call(this, b));
    };
    1 < arguments.length ? (a = arguments[1] instanceof Function ? arguments[1] : function() {
    }, b = "string" === typeof arguments[0] ? arguments[0] : "") : a = arguments[0] instanceof Function ? arguments[0] : function() {
    };
    if (b) {
      $(this).on("click tab", b, c);
    } else {
      $(this).on("click tab", c);
    }
  };
  return d;
};
Entry.SVG = function(a, b) {
  a = b ? b : document.getElementById(a);
  return Entry.SVG.createElement(a);
};
Entry.SVG.NS = "http://www.w3.org/2000/svg";
Entry.SVG.NS_XLINK = "http://www.w3.org/1999/xlink";
Entry.SVG.createElement = function(a, b) {
  var c;
  c = "string" === typeof a ? document.createElementNS(Entry.SVG.NS, a) : a;
  if (b) {
    b.href && (c.setAttributeNS(Entry.SVG.NS_XLINK, "href", b.href), delete b.href);
    for (var d in b) {
      c.setAttribute(d, b[d]);
    }
  }
  this instanceof SVGElement && this.appendChild(c);
  c.elem = Entry.SVG.createElement;
  c.attr = Entry.SVG.attr;
  c.addClass = Entry.SVG.addClass;
  c.removeClass = Entry.SVG.removeClass;
  c.hasClass = Entry.SVG.hasClass;
  c.remove = Entry.SVG.remove;
  c.removeAttr = Entry.SVG.removeAttr;
  "text" === a && c.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
  return c;
};
Entry.SVG.attr = function(a, b) {
  if ("string" === typeof a) {
    var c = {};
    c[a] = b;
    a = c;
  }
  if (a) {
    a.href && (this.setAttributeNS(Entry.SVG.NS_XLINK, "href", a.href), delete a.href);
    for (var d in a) {
      this.setAttribute(d, a[d]);
    }
  }
  return this;
};
Entry.SVG.addClass = function(a) {
  for (var b = this.getAttribute("class"), c = 0;c < arguments.length;c++) {
    a = arguments[c], this.hasClass(a) || (b += " " + a);
  }
  this.setAttribute("class", b);
  return this;
};
Entry.SVG.removeClass = function(a) {
  for (var b = this.getAttribute("class"), c = 0;c < arguments.length;c++) {
    a = arguments[c], this.hasClass(a) && (b = b.replace(new RegExp("(\\s|^)" + a + "(\\s|$)"), " "));
  }
  this.setAttribute("class", b);
  return this;
};
Entry.SVG.hasClass = function(a) {
  var b = this.getAttribute("class");
  return b ? b.match(new RegExp("(\\s|^)" + a + "(\\s|$)")) : !1;
};
Entry.SVG.remove = function() {
  this.parentNode && this.parentNode.removeChild(this);
};
Entry.SVG.removeAttr = function(a) {
  this.removeAttribute(a);
};
Entry.Dialog = function(a, b, c, d) {
  a.dialog && a.dialog.remove();
  a.dialog = this;
  this.parent = a;
  this.padding = 10;
  this.border = 2;
  "number" == typeof b && (b = String(b));
  Entry.console && Entry.console.print(b, c);
  this.message_ = b = b.match(/.{1,15}/g).join("\n");
  this.mode_ = c;
  "speak" !== c && "ask" !== c || this.generateSpeak();
  d || Entry.stage.loadDialog(this);
};
Entry.Dialog.prototype.generateSpeak = function() {
  this.object = new createjs.Container;
  var a = new createjs.Text;
  a.font = "15px NanumGothic";
  a.textBaseline = "top";
  a.textAlign = "left";
  a.text = this.message_;
  var b = a.getTransformedBounds(), c = b.height, b = 10 <= b.width ? b.width : 17, d = new createjs.Shape;
  d.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").rr(-this.padding, -this.padding, b + 2 * this.padding, c + 2 * this.padding, this.padding);
  this.object.addChild(d);
  this.object.regX = b / 2;
  this.object.regY = c / 2;
  this.width = b;
  this.height = c;
  this.notch = this.createSpeakNotch("ne");
  this.update();
  this.object.addChild(this.notch);
  this.object.addChild(a);
  Entry.requestUpdate = !0;
};
Entry.Dialog.prototype.update = function() {
  var a = this.parent.object.getTransformedBounds();
  if (!a && "textBox" === this.parent.type) {
    if (this._isNoContentTried) {
      delete this._isNoContentTried;
      return;
    }
    this.parent.setText(" ");
    a = this.parent.object.getTransformedBounds();
    this._isNoContentTried = !0;
  }
  var b = "";
  -135 < a.y - this.height - 20 - this.border ? (this.object.y = a.y - this.height / 2 - 20 - this.padding, b += "n") : (this.object.y = a.y + a.height + this.height / 2 + 20 + this.padding, b += "s");
  240 > a.x + a.width + this.width ? (this.object.x = a.x + a.width + this.width / 2, b += "e") : (this.object.x = a.x - this.width / 2, b += "w");
  this.notch.type != b && (this.object.removeChild(this.notch), this.notch = this.createSpeakNotch(b), this.object.addChild(this.notch));
  this._isNoContentTried && this.parent.setText("");
  Entry.requestUpdate = !0;
};
Entry.Dialog.prototype.createSpeakNotch = function(a) {
  var b = new createjs.Shape;
  b.type = a;
  "ne" == a ? b.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(0, this.height + this.padding - 1.5).lt(-10, this.height + this.padding + 20).lt(20, this.height + this.padding - 1.5) : "nw" == a ? b.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(this.width, this.height + this.padding - 1.5).lt(this.width + 10, this.height + this.padding + 20).lt(this.width - 20, this.height + this.padding - 1.5) : "se" == a ? b.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(0, -this.padding + 1.5).lt(-10, 
  -this.padding - 20).lt(20, -this.padding + 1.5) : "sw" == a && b.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(this.width, -this.padding + 1.5).lt(this.width + 10, -this.padding - 20).lt(this.width - 20, -this.padding + 1.5);
  return b;
};
Entry.Dialog.prototype.remove = function() {
  Entry.stage.unloadDialog(this);
  this.parent.dialog = null;
  Entry.requestUpdate = !0;
};
Entry.DoneProject = function(a) {
  this.generateView(a);
};
var p = Entry.DoneProject.prototype;
p.init = function(a) {
  this.projectId = a;
};
p.generateView = function(a) {
  var b = Entry.createElement("div");
  b.addClass("entryContainerDoneWorkspace");
  this.doneContainer = b;
  var c = Entry.createElement("iframe");
  c.setAttribute("id", "doneProjectframe");
  c.setAttribute("frameborder", 0);
  c.setAttribute("src", "/api/iframe/project/" + a);
  this.doneProjectFrame = c;
  this.doneContainer.appendChild(c);
  b.addClass("entryRemove");
};
p.getView = function() {
  return this.doneContainer;
};
p.resize = function() {
  document.getElementById("entryContainerWorkspaceId");
  var a = document.getElementById("doneProjectframe"), b = this.doneContainer.offsetWidth;
  a.width = b + "px";
  a.height = 9 * b / 16 + "px";
};
Entry.Engine = function() {
  function a(b) {
    var a = b.keyCode || b.which, d = Entry.stage.inputField;
    32 == a && d && d.hasFocus() || -1 < [37, 38, 39, 40, 32].indexOf(a) && b.preventDefault();
  }
  this.state = "stop";
  this.popup = null;
  this.isUpdating = !0;
  this.speeds = [1, 15, 30, 45, 60];
  this._mouseMoved = !1;
  Entry.keyPressed && Entry.keyPressed.attach(this, this.captureKeyEvent);
  Entry.addEventListener("canvasClick", function(b) {
    Entry.engine.fireEvent("mouse_clicked");
  });
  Entry.addEventListener("canvasClickCanceled", function(b) {
    Entry.engine.fireEvent("mouse_click_cancled");
  });
  Entry.addEventListener("entityClick", function(b) {
    Entry.engine.fireEventOnEntity("when_object_click", b);
  });
  Entry.addEventListener("entityClickCanceled", function(b) {
    Entry.engine.fireEventOnEntity("when_object_click_canceled", b);
  });
  "phone" != Entry.type && (Entry.addEventListener("stageMouseMove", function(b) {
    this._mouseMoved = !0;
  }.bind(this)), Entry.addEventListener("stageMouseOut", function(b) {
    Entry.engine.hideMouseView();
  }));
  Entry.addEventListener("run", function() {
    $(window).bind("keydown", a);
  });
  Entry.addEventListener("stop", function() {
    $(window).unbind("keydown", a);
  });
  setInterval(function() {
    this._mouseMoved && (this.updateMouseView(), this._mouseMoved = !1);
  }.bind(this), 100);
  Entry.message = new Entry.Event(window);
};
Entry.Engine.prototype.generateView = function(a, b) {
  if (b && "workspace" != b) {
    "minimize" == b ? (this.view_ = a, this.view_.addClass("entryEngine"), this.view_.addClass("entryEngineMinimize"), this.maximizeButton = Entry.createElement("button"), this.maximizeButton.addClass("entryEngineButtonMinimize"), this.maximizeButton.addClass("entryMaximizeButtonMinimize"), this.view_.appendChild(this.maximizeButton), this.maximizeButton.bindOnClick(function(b) {
      Entry.engine.toggleFullscreen();
    }), this.coordinateButton = Entry.createElement("button"), this.coordinateButton.addClass("entryEngineButtonMinimize"), this.coordinateButton.addClass("entryCoordinateButtonMinimize"), this.view_.appendChild(this.coordinateButton), this.coordinateButton.bindOnClick(function(b) {
      this.hasClass("toggleOn") ? this.removeClass("toggleOn") : this.addClass("toggleOn");
      Entry.stage.toggleCoordinator();
    }), this.stopButton = Entry.createElement("button"), this.stopButton.addClass("entryEngineButtonMinimize"), this.stopButton.addClass("entryStopButtonMinimize"), this.stopButton.addClass("entryRemove"), this.stopButton.innerHTML = Lang.Workspace.stop, this.view_.appendChild(this.stopButton), this.stopButton.bindOnClick(function(b) {
      this.blur();
      Entry.engine.toggleStop();
    }), this.pauseButton = Entry.createElement("button"), this.pauseButton.innerHTML = Lang.Workspace.pause, this.pauseButton.addClass("entryEngineButtonMinimize"), this.pauseButton.addClass("entryPauseButtonMinimize"), this.pauseButton.addClass("entryRemove"), this.view_.appendChild(this.pauseButton), this.pauseButton.bindOnClick(function(b) {
      this.blur();
      Entry.engine.togglePause();
    }), this.mouseView = Entry.createElement("div"), this.mouseView.addClass("entryMouseViewMinimize"), this.mouseView.addClass("entryRemove"), this.view_.appendChild(this.mouseView), Entry.addEventListener("loadComplete", function() {
      this.runButton = Entry.Dom("div", {class:"entryRunButtonBigMinimize", parent:$("#entryCanvasWrapper")});
      this.runButton.bindOnClick(function(b) {
        Entry.engine.toggleRun();
      });
    }.bind(this))) : "phone" == b && (this.view_ = a, this.view_.addClass("entryEngine", "entryEnginePhone"), this.headerView_ = Entry.createElement("div", "entryEngineHeader"), this.headerView_.addClass("entryEngineHeaderPhone"), this.view_.appendChild(this.headerView_), this.maximizeButton = Entry.createElement("button"), this.maximizeButton.addClass("entryEngineButtonPhone", "entryMaximizeButtonPhone"), this.headerView_.appendChild(this.maximizeButton), this.maximizeButton.bindOnClick(function(b) {
      Entry.engine.footerView_.addClass("entryRemove");
      Entry.engine.headerView_.addClass("entryRemove");
      Entry.launchFullScreen(Entry.engine.view_);
    }), document.addEventListener("fullscreenchange", function(b) {
      Entry.engine.exitFullScreen();
    }), document.addEventListener("webkitfullscreenchange", function(b) {
      Entry.engine.exitFullScreen();
    }), document.addEventListener("mozfullscreenchange", function(b) {
      Entry.engine.exitFullScreen();
    }), this.footerView_ = Entry.createElement("div", "entryEngineFooter"), this.footerView_.addClass("entryEngineFooterPhone"), this.view_.appendChild(this.footerView_), this.runButton = Entry.createElement("button"), this.runButton.addClass("entryEngineButtonPhone", "entryRunButtonPhone"), Entry.objectAddable && this.runButton.addClass("small"), this.runButton.innerHTML = Lang.Workspace.run, this.footerView_.appendChild(this.runButton), this.runButton.bindOnClick(function(b) {
      Entry.engine.toggleRun();
    }), this.stopButton = Entry.createElement("button"), this.stopButton.addClass("entryEngineButtonPhone", "entryStopButtonPhone", "entryRemove"), Entry.objectAddable && this.stopButton.addClass("small"), this.stopButton.innerHTML = Lang.Workspace.stop, this.footerView_.appendChild(this.stopButton), this.stopButton.bindOnClick(function(b) {
      Entry.engine.toggleStop();
    }));
  } else {
    this.view_ = a;
    this.view_.addClass("entryEngine_w");
    this.view_.addClass("entryEngineWorkspace_w");
    var c = Entry.createElement("button");
    this.speedButton = c;
    this.speedButton.addClass("entrySpeedButtonWorkspace", "entryEngineTopWorkspace", "entryEngineButtonWorkspace_w");
    this.view_.appendChild(this.speedButton);
    this.speedButton.bindOnClick(function(b) {
      Entry.engine.toggleSpeedPanel();
      c.blur();
    });
    this.maximizeButton = Entry.createElement("button");
    this.maximizeButton.addClass("entryEngineButtonWorkspace_w", "entryEngineTopWorkspace", "entryMaximizeButtonWorkspace_w");
    this.view_.appendChild(this.maximizeButton);
    this.maximizeButton.bindOnClick(function(b) {
      Entry.engine.toggleFullscreen();
      this.blur();
    });
    var d = Entry.createElement("button");
    this.coordinateButton = d;
    this.coordinateButton.addClass("entryEngineButtonWorkspace_w", "entryEngineTopWorkspace", "entryCoordinateButtonWorkspace_w");
    this.view_.appendChild(this.coordinateButton);
    this.coordinateButton.bindOnClick(function(b) {
      this.hasClass("toggleOn") ? this.removeClass("toggleOn") : this.addClass("toggleOn");
      d.blur();
      this.blur();
      Entry.stage.toggleCoordinator();
    });
    this.addButton = Entry.createElement("button");
    this.addButton.addClass("entryEngineButtonWorkspace_w");
    this.addButton.addClass("entryAddButtonWorkspace_w");
    this.addButton.innerHTML = Lang.Workspace.add_object;
    this.addButton.bindOnClick(function(b) {
      Entry.dispatchEvent("openSpriteManager");
      this.blur();
    });
    this.view_.appendChild(this.addButton);
    this.runButton = Entry.createElement("button");
    this.runButton.addClass("entryEngineButtonWorkspace_w");
    this.runButton.addClass("entryRunButtonWorkspace_w");
    this.runButton.innerHTML = Lang.Workspace.run;
    this.view_.appendChild(this.runButton);
    this.runButton.bindOnClick(function(b) {
      Entry.engine.toggleRun();
      this.blur();
    });
    this.runButton2 = Entry.createElement("button");
    this.runButton2.addClass("entryEngineButtonWorkspace_w");
    this.runButton2.addClass("entryRunButtonWorkspace_w2");
    this.view_.appendChild(this.runButton2);
    this.runButton2.bindOnClick(function(b) {
      this.blur();
      Entry.engine.toggleRun();
    });
    this.stopButton = Entry.createElement("button");
    this.stopButton.addClass("entryEngineButtonWorkspace_w");
    this.stopButton.addClass("entryStopButtonWorkspace_w");
    this.stopButton.addClass("entryRemove");
    this.stopButton.innerHTML = Lang.Workspace.stop;
    this.view_.appendChild(this.stopButton);
    this.stopButton.bindOnClick(function(b) {
      this.blur();
      Entry.engine.toggleStop();
    });
    this.stopButton2 = Entry.createElement("button");
    this.stopButton2.addClass("entryEngineButtonWorkspace_w");
    this.stopButton2.addClass("entryStopButtonWorkspace_w2");
    this.stopButton2.addClass("entryRemove");
    this.stopButton2.innerHTML = Lang.Workspace.stop;
    this.view_.appendChild(this.stopButton2);
    this.stopButton2.bindOnClick(function(b) {
      this.blur();
      Entry.engine.toggleStop();
    });
    this.pauseButton = Entry.createElement("button");
    this.pauseButton.addClass("entryEngineButtonWorkspace_w");
    this.pauseButton.addClass("entryPauseButtonWorkspace_w");
    this.pauseButton.addClass("entryRemove");
    this.view_.appendChild(this.pauseButton);
    this.pauseButton.bindOnClick(function(b) {
      this.blur();
      Entry.engine.togglePause();
    });
    this.mouseView = Entry.createElement("div");
    this.mouseView.addClass("entryMouseViewWorkspace_w");
    this.mouseView.addClass("entryRemove");
    this.view_.appendChild(this.mouseView);
  }
};
Entry.Engine.prototype.toggleSpeedPanel = function() {
  if (this.speedPanelOn) {
    this.speedPanelOn = !1, $(Entry.stage.canvas.canvas).animate({top:"24px"}), this.coordinateButton.removeClass("entryRemove"), this.maximizeButton.removeClass("entryRemove"), this.mouseView.removeClass("entryRemoveElement"), $(this.speedLabel_).remove(), delete this.speedLabel_, $(this.speedProgress_).fadeOut(null, function(b) {
      $(this).remove();
      delete this.speedProgress_;
    }), $(this.speedHandle_).remove(), delete this.speedHandle_;
  } else {
    this.speedPanelOn = !0;
    $(Entry.stage.canvas.canvas).animate({top:"41px"});
    this.coordinateButton.addClass("entryRemove");
    this.maximizeButton.addClass("entryRemove");
    this.mouseView.addClass("entryRemoveElement");
    this.speedLabel_ = Entry.createElement("div", "entrySpeedLabelWorkspace");
    this.speedLabel_.innerHTML = Lang.Workspace.speed;
    this.view_.insertBefore(this.speedLabel_, this.maximizeButton);
    this.speedProgress_ = Entry.createElement("table", "entrySpeedProgressWorkspace");
    for (var a = Entry.createElement("tr"), b = this.speeds, c = 0;5 > c;c++) {
      (function(c) {
        var d = Entry.createElement("td", "progressCell" + c);
        d.bindOnClick(function() {
          Entry.engine.setSpeedMeter(b[c]);
        });
        a.appendChild(d);
      })(c);
    }
    this.view_.insertBefore(this.speedProgress_, this.maximizeButton);
    this.speedProgress_.appendChild(a);
    this.speedHandle_ = Entry.createElement("div", "entrySpeedHandleWorkspace");
    var d = (Entry.interfaceState.canvasWidth - 84) / 5;
    $(this.speedHandle_).bind("mousedown.speedPanel touchstart.speedPanel", function(b) {
      function a(b) {
        b.stopPropagation();
        b = Entry.Utils.convertMouseEvent(b);
        b = Math.floor((b.clientX - 80) / (5 * d) * 5);
        0 > b || 4 < b || Entry.engine.setSpeedMeter(Entry.engine.speeds[b]);
      }
      function c(b) {
        $(document).unbind(".speedPanel");
      }
      b.stopPropagation && b.stopPropagation();
      b.preventDefault && b.preventDefault();
      if (0 === b.button || b.originalEvent && b.originalEvent.touches) {
        Entry.Utils.convertMouseEvent(b), b = $(document), b.bind("mousemove.speedPanel touchmove.speedPanel", a), b.bind("mouseup.speedPanel touchend.speedPanel", c);
      }
    });
    this.view_.insertBefore(this.speedHandle_, this.maximizeButton);
    this.setSpeedMeter(Entry.FPS);
  }
};
Entry.Engine.prototype.setSpeedMeter = function(a) {
  var b = this.speeds.indexOf(a);
  0 > b || (b = Math.min(4, b), b = Math.max(0, b), this.speedPanelOn && (this.speedHandle_.style.left = (Entry.interfaceState.canvasWidth - 80) / 10 * (2 * b + 1) + 80 - 9 + "px"), Entry.FPS != a && (clearInterval(this.ticker), this.ticker = setInterval(this.update, Math.floor(1E3 / a)), Entry.FPS = a));
};
Entry.Engine.prototype.start = function(a) {
  createjs.Ticker.setFPS(Entry.FPS);
  this.ticker || (this.ticker = setInterval(this.update, Math.floor(1E3 / Entry.FPS)));
};
Entry.Engine.prototype.stop = function() {
  createjs.Ticker.reset();
  clearInterval(this.ticker);
  this.ticker = null;
};
Entry.Engine.prototype.update = function() {
  Entry.engine.isState("run") && (Entry.engine.computeObjects(), Entry.hw.update());
};
Entry.Engine.prototype.computeObjects = function() {
  Entry.container.mapObjectOnScene(this.computeFunction);
};
Entry.Engine.prototype.computeFunction = function(a) {
  a.script.tick();
};
Entry.Engine.computeThread = function(a, b) {
  Entry.engine.isContinue = !0;
  for (a = !1;b && Entry.engine.isContinue && !a;) {
    Entry.engine.isContinue = !b.isRepeat;
    var c = b.run();
    a = c && c === b;
    b = c;
  }
  return b;
};
Entry.Engine.prototype.isState = function(a) {
  return -1 < this.state.indexOf(a);
};
Entry.Engine.prototype.run = function() {
  this.isState("run") ? this.toggleStop() : (this.isState("stop") || this.isState("pause")) && this.toggleRun();
};
Entry.Engine.prototype.toggleRun = function() {
  if ("pause" === this.state) {
    this.togglePause();
  } else {
    if (Entry.playground && Entry.playground.mainWorkspace) {
      var a = Entry.playground.mainWorkspace, b = a.mode;
      b == Entry.Workspace.MODE_VIMBOARD && a.loadCodeFromText(b);
    }
    Entry.addActivity("run");
    "stop" == this.state && (Entry.container.mapEntity(function(b) {
      b.takeSnapshot();
    }), Entry.variableContainer.mapVariable(function(b) {
      b.takeSnapshot();
    }), Entry.variableContainer.mapList(function(b) {
      b.takeSnapshot();
    }), this.projectTimer.takeSnapshot(), Entry.container.inputValue.takeSnapshot(), Entry.container.takeSequenceSnapshot(), Entry.scene.takeStartSceneSnapshot(), this.state = "run", this.fireEvent("start"));
    this.state = "run";
    "mobile" == Entry.type && this.view_.addClass("entryEngineBlueWorkspace");
    this.runButton && (this.pauseButton.innerHTML = Lang.Workspace.pause, this.runButton.addClass("run"), this.runButton.addClass("entryRemove"), this.stopButton.removeClass("entryRemove"), this.pauseButton && this.pauseButton.removeClass("entryRemove"), this.runButton2 && this.runButton2.addClass("entryRemove"), this.stopButton2 && this.stopButton2.removeClass("entryRemove"));
    this.isUpdating || (Entry.engine.update(), Entry.engine.isUpdating = !0);
    Entry.stage.selectObject();
    Entry.dispatchEvent("run");
  }
};
Entry.Engine.prototype.toggleStop = function() {
  Entry.addActivity("stop");
  var a = Entry.container, b = Entry.variableContainer;
  a.mapEntity(function(b) {
    b.loadSnapshot();
    b.object.filters = [];
    b.resetFilter();
    b.dialog && b.dialog.remove();
    b.brush && b.removeBrush();
  });
  b.mapVariable(function(b) {
    b.loadSnapshot();
  });
  b.mapList(function(b) {
    b.loadSnapshot();
  });
  this.stopProjectTimer();
  a.clearRunningState();
  a.loadSequenceSnapshot();
  this.projectTimer.loadSnapshot();
  Entry.container.inputValue.loadSnapshot();
  Entry.scene.loadStartSceneSnapshot();
  Entry.Func.clearThreads();
  createjs.Sound.setVolume(1);
  createjs.Sound.stop();
  this.view_.removeClass("entryEngineBlueWorkspace");
  this.runButton && (this.runButton.removeClass("entryRemove"), this.stopButton.addClass("entryRemove"), this.pauseButton && this.pauseButton.addClass("entryRemove"), this.runButton2 && this.runButton2.removeClass("entryRemove"), this.stopButton2 && this.stopButton2.addClass("entryRemove"));
  this.state = "stop";
  Entry.dispatchEvent("stop");
  Entry.stage.hideInputField();
};
Entry.Engine.prototype.togglePause = function() {
  var a = Entry.engine.projectTimer;
  "pause" == this.state ? (a.pausedTime += (new Date).getTime() - a.pauseStart, a.isPaused ? a.pauseStart = (new Date).getTime() : delete a.pauseStart, this.state = "run", this.runButton && (this.pauseButton.innerHTML = Lang.Workspace.pause, this.runButton.addClass("entryRemove"), this.runButton2 && this.runButton2.addClass("entryRemove"))) : (this.state = "pause", a.isPaused && (a.pausedTime += (new Date).getTime() - a.pauseStart), a.pauseStart = (new Date).getTime(), this.runButton && (this.pauseButton.innerHTML = 
  Lang.Workspace.restart, this.runButton.removeClass("entryRemove"), this.stopButton.removeClass("entryRemove"), this.runButton2 && this.runButton2.removeClass("entryRemove")));
};
Entry.Engine.prototype.fireEvent = function(a) {
  "run" === this.state && Entry.container.mapEntityIncludeCloneOnScene(this.raiseEvent, a);
};
Entry.Engine.prototype.raiseEvent = function(a, b) {
  a.parent.script.raiseEvent(b, a);
};
Entry.Engine.prototype.fireEventOnEntity = function(a, b) {
  "run" == this.state && Entry.container.mapEntityIncludeCloneOnScene(this.raiseEventOnEntity, [b, a]);
};
Entry.Engine.prototype.raiseEventOnEntity = function(a, b) {
  a === b[0] && a.parent.script.raiseEvent(b[1], a);
};
Entry.Engine.prototype.captureKeyEvent = function(a) {
  var b = a.keyCode, c = Entry.type;
  a.ctrlKey && "workspace" == c ? 83 == b ? (a.preventDefault(), Entry.dispatchEvent("saveWorkspace")) : 82 == b ? (a.preventDefault(), Entry.engine.run()) : 90 == b && (a.preventDefault(), Entry.dispatchEvent(a.shiftKey ? "redo" : "undo")) : Entry.engine.isState("run") && Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, ["keyPress", b]);
  Entry.engine.isState("stop") && "workspace" === c && 37 <= b && 40 >= b && Entry.stage.moveSprite(a);
};
Entry.Engine.prototype.raiseKeyEvent = function(a, b) {
  return a.parent.script.raiseEvent(b[0], a, String(b[1]));
};
Entry.Engine.prototype.updateMouseView = function() {
  var a = Entry.stage.mouseCoordinate;
  this.mouseView.textContent = "X : " + a.x + ", Y : " + a.y;
  this.mouseView.removeClass("entryRemove");
};
Entry.Engine.prototype.hideMouseView = function() {
  this.mouseView.addClass("entryRemove");
};
Entry.Engine.prototype.toggleFullscreen = function() {
  if (this.popup) {
    this.popup.remove(), this.popup = null;
  } else {
    this.popup = new Entry.Popup;
    if ("workspace" != Entry.type) {
      var a = $(document);
      $(this.popup.body_).css("top", a.scrollTop());
      $("body").css("overflow", "hidden");
      popup.window_.appendChild(Entry.stage.canvas.canvas);
      popup.window_.appendChild(Entry.engine.runButton[0]);
    }
    popup.window_.appendChild(Entry.engine.view_);
  }
  Entry.windowResized.notify();
};
Entry.Engine.prototype.exitFullScreen = function() {
  document.webkitIsFullScreen || document.mozIsFullScreen || document.isFullScreen || (Entry.engine.footerView_.removeClass("entryRemove"), Entry.engine.headerView_.removeClass("entryRemove"));
  Entry.windowResized.notify();
};
Entry.Engine.prototype.showProjectTimer = function() {
  Entry.engine.projectTimer && this.projectTimer.setVisible(!0);
};
Entry.Engine.prototype.hideProjectTimer = function() {
  var a = this.projectTimer;
  if (a && a.isVisible() && !this.isState("run")) {
    for (var b = Entry.container.getAllObjects(), c = ["get_project_timer_value", "reset_project_timer", "set_visible_project_timer", "choose_project_timer_action"], d = 0, e = b.length;d < e;d++) {
      for (var f = b[d].script, g = 0;g < c.length;g++) {
        if (f.hasBlockType(c[g])) {
          return;
        }
      }
    }
    a.setVisible(!1);
  }
};
Entry.Engine.prototype.clearTimer = function() {
  clearInterval(this.ticker);
  clearInterval(this.projectTimer.tick);
};
Entry.Engine.prototype.startProjectTimer = function() {
  var a = this.projectTimer;
  a && (a.start = (new Date).getTime(), a.isInit = !0, a.pausedTime = 0, a.tick = setInterval(function(b) {
    Entry.engine.updateProjectTimer();
  }, 1E3 / 60));
};
Entry.Engine.prototype.stopProjectTimer = function() {
  var a = this.projectTimer;
  a && (this.updateProjectTimer(0), a.isPaused = !1, a.isInit = !1, a.pausedTime = 0, clearInterval(a.tick));
};
Entry.Engine.prototype.updateProjectTimer = function(a) {
  var b = Entry.engine, c = b.projectTimer;
  if (c) {
    var d = (new Date).getTime();
    "undefined" == typeof a ? c.isPaused || b.isState("pause") || c.setValue((d - c.start - c.pausedTime) / 1E3) : (c.setValue(a), c.pausedTime = 0, c.start = d);
  }
};
Entry.Engine.prototype.raiseMessage = function(a) {
  Entry.message.notify(Entry.variableContainer.getMessage(a));
  return Entry.container.mapEntityIncludeCloneOnScene(this.raiseKeyEvent, ["when_message_cast", a]);
};
Entry.EntityObject = function(a) {
  this.parent = a;
  this.type = a.objectType;
  this.flip = !1;
  this.collision = Entry.Utils.COLLISION.NONE;
  this.id = Entry.generateHash();
  "sprite" == this.type ? (this.object = new createjs.Bitmap, this.effect = {}, this.setInitialEffectValue()) : "textBox" == this.type && (this.object = new createjs.Container, this.textObject = new createjs.Text, this.textObject.font = "20px Nanum Gothic", this.textObject.textBaseline = "middle", this.textObject.textAlign = "center", this.bgObject = new createjs.Shape, this.bgObject.graphics.setStrokeStyle(1).beginStroke("#f00").drawRect(0, 0, 100, 100), this.object.addChild(this.bgObject), this.object.addChild(this.textObject), 
  this.fontType = "Nanum Gothic", this.fontSize = 20, this.strike = this.underLine = this.fontItalic = this.fontBold = !1);
  this.object.entity = this;
  this.object.cursor = "pointer";
  this.object.on("mousedown", function(b) {
    var a = this.entity.parent.id;
    Entry.dispatchEvent("entityClick", this.entity);
    Entry.stage.isObjectClick = !0;
    "minimize" != Entry.type && Entry.engine.isState("stop") && (this.offset = {x:-this.parent.x + this.entity.getX() - (.75 * b.stageX - 240), y:-this.parent.y - this.entity.getY() - (.75 * b.stageY - 135)}, this.cursor = "move", this.entity.initCommand(), Entry.container.selectObject(a));
  });
  this.object.on("pressup", function(b) {
    Entry.dispatchEvent("entityClickCanceled", this.entity);
    this.cursor = "pointer";
    this.entity.checkCommand();
  });
  this.object.on("pressmove", function(b) {
    "minimize" != Entry.type && Entry.engine.isState("stop") && !this.entity.parent.getLock() && (this.entity.doCommand(), this.entity.setX(.75 * b.stageX - 240 + this.offset.x), this.entity.setY(-(.75 * b.stageY - 135) - this.offset.y), Entry.stage.updateObject());
  });
};
Entry.EntityObject.prototype.injectModel = function(a, b) {
  "sprite" == this.type ? this.setImage(a) : "textBox" == this.type && (a = this.parent, b.text = b.text || a.text || a.name, this.setFont(b.font), this.setBGColour(b.bgColor), this.setColour(b.colour), this.setUnderLine(b.underLine), this.setStrike(b.strike), this.setText(b.text));
  b && this.syncModel_(b);
};
Entry.EntityObject.prototype.syncModel_ = function(a) {
  this.setX(a.x);
  this.setY(a.y);
  this.setRegX(a.regX);
  this.setRegY(a.regY);
  this.setScaleX(a.scaleX);
  this.setScaleY(a.scaleY);
  this.setRotation(a.rotation);
  this.setDirection(a.direction, !0);
  this.setLineBreak(a.lineBreak);
  this.setWidth(a.width);
  this.setHeight(a.height);
  this.setText(a.text);
  this.setTextAlign(a.textAlign);
  this.setFontSize(a.fontSize || this.getFontSize());
  this.setVisible(a.visible);
};
Entry.EntityObject.prototype.initCommand = function() {
  Entry.engine.isState("stop") && (this.isCommandValid = !1, Entry.stateManager && Entry.stateManager.addCommand("edit entity", this, this.restoreEntity, this.toJSON()));
};
Entry.EntityObject.prototype.doCommand = function() {
  this.isCommandValid = !0;
};
Entry.EntityObject.prototype.checkCommand = function() {
  Entry.engine.isState("stop") && !this.isCommandValid && Entry.dispatchEvent("cancelLastCommand");
};
Entry.EntityObject.prototype.restoreEntity = function(a) {
  var b = this.toJSON();
  this.syncModel_(a);
  Entry.dispatchEvent("updateObject");
  Entry.stateManager && Entry.stateManager.addCommand("restore object", this, this.restoreEntity, b);
};
Entry.EntityObject.prototype.setX = function(a) {
  "number" == typeof a && (this.x = a, this.object.x = this.x, this.isClone || this.parent.updateCoordinateView(), this.updateDialog(), Entry.requestUpdate = !0);
};
Entry.EntityObject.prototype.getX = function() {
  return this.x;
};
Entry.EntityObject.prototype.setY = function(a) {
  "number" == typeof a && (this.y = a, this.object.y = -this.y, this.isClone || this.parent.updateCoordinateView(), this.updateDialog(), Entry.requestUpdate = !0);
};
Entry.EntityObject.prototype.getY = function() {
  return this.y;
};
Entry.EntityObject.prototype.getDirection = function() {
  return this.direction;
};
Entry.EntityObject.prototype.setDirection = function(a, b) {
  a || (a = 0);
  "vertical" != this.parent.getRotateMethod() || b || (0 <= this.direction && 180 > this.direction) == (0 <= a && 180 > a) || (this.setScaleX(-this.getScaleX()), Entry.stage.updateObject(), this.flip = !this.flip);
  this.direction = a.mod(360);
  this.object.direction = this.direction;
  this.isClone || this.parent.updateRotationView();
  Entry.dispatchEvent("updateObject");
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.setRotation = function(a) {
  "free" != this.parent.getRotateMethod() && (a = 0);
  this.rotation = a.mod(360);
  this.object.rotation = this.rotation;
  this.updateDialog();
  this.isClone || this.parent.updateRotationView();
  Entry.dispatchEvent("updateObject");
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getRotation = function() {
  return this.rotation;
};
Entry.EntityObject.prototype.setRegX = function(a) {
  "textBox" == this.type && (a = 0);
  this.regX = a;
  this.object.regX = this.regX;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getRegX = function() {
  return this.regX;
};
Entry.EntityObject.prototype.setRegY = function(a) {
  "textBox" == this.type && (a = 0);
  this.regY = a;
  this.object.regY = this.regY;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getRegY = function() {
  return this.regY;
};
Entry.EntityObject.prototype.setScaleX = function(a) {
  this.scaleX = a;
  this.object.scaleX = this.scaleX;
  this.parent.updateCoordinateView();
  this.updateDialog();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getScaleX = function() {
  return this.scaleX;
};
Entry.EntityObject.prototype.setScaleY = function(a) {
  this.scaleY = a;
  this.object.scaleY = this.scaleY;
  this.parent.updateCoordinateView();
  this.updateDialog();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getScaleY = function() {
  return this.scaleY;
};
Entry.EntityObject.prototype.setSize = function(a) {
  1 > a && (a = 1);
  a /= this.getSize();
  this.setScaleX(this.getScaleX() * a);
  this.setScaleY(this.getScaleY() * a);
  this.isClone || this.parent.updateCoordinateView();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getSize = function() {
  return (this.getWidth() * Math.abs(this.getScaleX()) + this.getHeight() * Math.abs(this.getScaleY())) / 2;
};
Entry.EntityObject.prototype.setWidth = function(a) {
  this.width = a;
  this.object.width = this.width;
  this.textObject && this.getLineBreak() && (this.textObject.lineWidth = this.width);
  this.updateDialog();
  this.updateBG();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getWidth = function() {
  return this.width;
};
Entry.EntityObject.prototype.setHeight = function(a) {
  this.height = a;
  this.textObject && (this.object.height = this.height, this.alignTextBox());
  this.updateDialog();
  this.updateBG();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getHeight = function() {
  return this.height;
};
Entry.EntityObject.prototype.setColour = function(a) {
  a || (a = "#000000");
  this.colour = a;
  this.textObject && (this.textObject.color = this.colour);
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getColour = function() {
  return this.colour;
};
Entry.EntityObject.prototype.setBGColour = function(a) {
  a || (a = "transparent");
  this.bgColor = a;
  this.updateBG();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getBGColour = function() {
  return this.bgColor;
};
Entry.EntityObject.prototype.setUnderLine = function(a) {
  void 0 === a && (a = !1);
  this.underLine = a;
  this.textObject.underLine = a;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getUnderLine = function() {
  return this.underLine;
};
Entry.EntityObject.prototype.setStrike = function(a) {
  void 0 === a && (a = !1);
  this.strike = a;
  this.textObject.strike = a;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getStrike = function() {
  return this.strike;
};
Entry.EntityObject.prototype.getFont = function() {
  var a = [];
  this.fontBold && a.push("bold");
  this.fontItalic && a.push("italic");
  a.push(this.getFontSize() + "px");
  a.push(this.fontType);
  return a.join(" ");
};
Entry.EntityObject.prototype.setFont = function(a) {
  if ("textBox" == this.parent.objectType && this.font !== a) {
    a || (a = "20px Nanum Gothic");
    var b = a.split(" "), c;
    if (c = -1 < b.indexOf("bold")) {
      b.splice(c - 1, 1), this.setFontBold(!0);
    }
    if (c = -1 < b.indexOf("italic")) {
      b.splice(c - 1, 1), this.setFontItalic(!0);
    }
    c = parseInt(b.shift());
    this.setFontSize(c);
    this.setFontType(b.join(" "));
    this.font = this.getFont();
    this.textObject.font = a;
    Entry.stage.update();
    this.setWidth(this.textObject.getMeasuredWidth());
    this.updateBG();
    Entry.stage.updateObject();
  }
};
Entry.EntityObject.prototype.setLineHeight = function() {
  switch(this.getFontType()) {
    case "Nanum Gothic Coding":
      this.textObject.lineHeight = this.fontSize;
      break;
    default:
      this.textObject.lineHeight = 0;
  }
};
Entry.EntityObject.prototype.syncFont = function() {
  this.textObject.font = this.getFont();
  this.setLineHeight();
  Entry.stage.update();
  this.getLineBreak() || this.setWidth(this.textObject.getMeasuredWidth());
  Entry.stage.updateObject();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getFontType = function() {
  return this.fontType;
};
Entry.EntityObject.prototype.setFontType = function(a) {
  "textBox" == this.parent.objectType && (this.fontType = a ? a : "Nanum Gothic", this.syncFont());
};
Entry.EntityObject.prototype.getFontSize = function(a) {
  return this.fontSize;
};
Entry.EntityObject.prototype.setFontSize = function(a) {
  "textBox" == this.parent.objectType && this.fontSize != a && (this.fontSize = a ? a : 20, this.syncFont(), this.alignTextBox());
};
Entry.EntityObject.prototype.setFontBold = function(a) {
  this.fontBold = a;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.toggleFontBold = function() {
  this.fontBold = !this.fontBold;
  this.syncFont();
  return this.fontBold;
};
Entry.EntityObject.prototype.setFontItalic = function(a) {
  this.fontItalic = a;
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.toggleFontItalic = function() {
  this.fontItalic = !this.fontItalic;
  this.syncFont();
  return this.fontItalic;
};
Entry.EntityObject.prototype.setFontName = function(a) {
  for (var b = this.font.split(" "), c = [], d = 0, e = b.length;d < e;d++) {
    ("bold" === b[d] || "italic" === b[d] || -1 < b[d].indexOf("px")) && c.push(b[d]);
  }
  this.setFont(c.join(" ") + " " + a);
};
Entry.EntityObject.prototype.getFontName = function() {
  if ("textBox" == this.type) {
    if (!this.font) {
      return "";
    }
    for (var a = this.font.split(" "), b = [], c = 0, d = a.length;c < d;c++) {
      "bold" !== a[c] && "italic" !== a[c] && -1 === a[c].indexOf("px") && b.push(a[c]);
    }
    return b.join(" ").trim();
  }
};
Entry.EntityObject.prototype.setText = function(a) {
  "textBox" == this.parent.objectType && (void 0 === a && (a = ""), this.text = a, this.textObject.text = this.text, this.lineBreak || (this.setWidth(this.textObject.getMeasuredWidth()), this.parent.updateCoordinateView()), this.updateBG(), Entry.stage.updateObject());
};
Entry.EntityObject.prototype.getText = function() {
  return this.text;
};
Entry.EntityObject.prototype.setTextAlign = function(a) {
  "textBox" == this.parent.objectType && (void 0 === a && (a = Entry.TEXT_ALIGN_CENTER), this.textAlign = a, this.textObject.textAlign = Entry.TEXT_ALIGNS[this.textAlign], this.alignTextBox(), this.updateBG(), Entry.stage.updateObject());
};
Entry.EntityObject.prototype.getTextAlign = function() {
  return this.textAlign;
};
Entry.EntityObject.prototype.setLineBreak = function(a) {
  if ("textBox" == this.parent.objectType) {
    void 0 === a && (a = !1);
    var b = this.lineBreak;
    this.lineBreak = a;
    b && !this.lineBreak ? (this.textObject.lineWidth = null, this.setHeight(this.textObject.getMeasuredLineHeight()), this.setText(this.getText().replace(/\n/g, ""))) : !b && this.lineBreak && (this.setFontSize(this.getFontSize() * this.getScaleX()), this.setHeight(3 * this.textObject.getMeasuredLineHeight()), this.setWidth(this.getWidth() * this.getScaleX()), this.setScaleX(1), this.setScaleY(1), this.textObject.lineWidth = this.getWidth(), this.alignTextBox());
    Entry.stage.updateObject();
  }
};
Entry.EntityObject.prototype.getLineBreak = function() {
  return this.lineBreak;
};
Entry.EntityObject.prototype.setVisible = function(a) {
  void 0 === a && (a = !0);
  this.visible = a;
  this.object.visible = this.visible;
  this.dialog && this.syncDialogVisible();
  Entry.requestUpdate = !0;
  return this.visible;
};
Entry.EntityObject.prototype.getVisible = function() {
  return this.visible;
};
Entry.EntityObject.prototype.setImage = function(a) {
  var b = this;
  delete a._id;
  Entry.assert("sprite" == this.type, "Set image is only for sprite object");
  a.id || (a.id = Entry.generateHash());
  this.picture = a;
  var c = this.picture.dimension, d = this.getRegX() - this.getWidth() / 2, e = this.getRegY() - this.getHeight() / 2;
  this.setWidth(c.width);
  this.setHeight(c.height);
  c.scaleX || (c.scaleX = this.getScaleX(), c.scaleY = this.getScaleY());
  this.setScaleX(this.scaleX);
  this.setScaleY(this.scaleY);
  this.setRegX(this.width / 2 + d);
  this.setRegY(this.height / 2 + e);
  var f = a.id + this.id, g = Entry.container.getCachedPicture(f);
  g ? (Entry.image = g, this.object.image = g, this.object.cache(0, 0, this.getWidth(), this.getHeight())) : (g = new Image, a.fileurl ? g.src = a.fileurl : (a = a.filename, g.src = Entry.defaultPath + "/uploads/" + a.substring(0, 2) + "/" + a.substring(2, 4) + "/image/" + a + ".png"), this.object.image = g, this.object.cache(0, 0, this.getWidth(), this.getHeight()), g.onload = function(a) {
    Entry.container.cachePicture(f, g);
    Entry.image = g;
    b.object.image = g;
    b.object.cache(0, 0, b.getWidth(), b.getHeight());
    Entry.requestUpdate = !0;
  });
  Entry.dispatchEvent("updateObject");
};
Entry.EntityObject.prototype.applyFilter = function(a) {
  function b(b, a) {
    for (var c in b) {
      if (b[c] !== a[c]) {
        return !1;
      }
    }
    return !0;
  }
  var c = this.effect, d = this.object;
  if (a || !b(c, this.getInitialEffectValue())) {
    (function(b, a) {
      var c = [], d = Entry.adjustValueWithMaxMin;
      b.brightness = b.brightness;
      var e = new createjs.ColorMatrix;
      e.adjustColor(d(b.brightness, -100, 100), 0, 0, 0);
      e = new createjs.ColorMatrixFilter(e);
      c.push(e);
      b.hue = b.hue.mod(360);
      e = new createjs.ColorMatrix;
      e.adjustColor(0, 0, 0, b.hue);
      e = new createjs.ColorMatrixFilter(e);
      c.push(e);
      var e = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], f = 10.8 * b.hsv * Math.PI / 180, l = Math.cos(f), f = Math.sin(f), n = Math.abs(b.hsv / 100);
      1 < n && (n -= Math.floor(n));
      0 < n && .33 >= n ? e = [1, 0, 0, 0, 0, 0, l, f, 0, 0, 0, -1 * f, l, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1] : .66 >= n ? e = [l, 0, f, 0, 0, 0, 1, 0, 0, 0, f, 0, l, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1] : .99 >= n && (e = [l, f, 0, 0, 0, -1 * f, l, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
      e = (new createjs.ColorMatrix).concat(e);
      e = new createjs.ColorMatrixFilter(e);
      c.push(e);
      a.alpha = b.alpha = d(b.alpha, 0, 1);
      a.filters = c;
    })(c, d), d.cache(0, 0, this.getWidth(), this.getHeight()), Entry.requestUpdate = !0;
  }
};
Entry.EntityObject.prototype.resetFilter = function() {
  "sprite" == this.parent.objectType && (this.object.filters = [], this.setInitialEffectValue(), this.object.alpha = this.effect.alpha, this.object.cache(0, 0, this.getWidth(), this.getHeight()), Entry.requestUpdate = !0);
};
Entry.EntityObject.prototype.updateDialog = function() {
  this.dialog && this.dialog.update();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.takeSnapshot = function() {
  this.snapshot_ = this.toJSON();
  this.collision = Entry.Utils.COLLISION.NONE;
};
Entry.EntityObject.prototype.loadSnapshot = function() {
  this.snapshot_ && this.syncModel_(this.snapshot_);
  "sprite" == this.parent.objectType && this.setImage(this.parent.getPicture());
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.removeClone = function() {
  if (this.isClone) {
    this.dialog && this.dialog.remove();
    this.brush && this.removeBrush();
    Entry.stage.unloadEntity(this);
    var a = this.parent.clonedEntities.indexOf(this);
    this.parent.clonedEntities.splice(a, 1);
    Entry.Utils.isFunction(this.clearExecutor) && this.clearExecutor();
  }
};
Entry.EntityObject.prototype.clearExecutor = function() {
  this.parent.script.clearExecutorsByEntity(this);
};
Entry.EntityObject.prototype.toJSON = function() {
  var a = {};
  a.x = Entry.cutDecimal(this.getX());
  a.y = Entry.cutDecimal(this.getY());
  a.regX = Entry.cutDecimal(this.getRegX());
  a.regY = Entry.cutDecimal(this.getRegY());
  a.scaleX = this.getScaleX();
  a.scaleY = this.getScaleY();
  a.rotation = Entry.cutDecimal(this.getRotation());
  a.direction = Entry.cutDecimal(this.getDirection());
  a.width = Entry.cutDecimal(this.getWidth());
  a.height = Entry.cutDecimal(this.getHeight());
  a.font = this.getFont();
  a.visible = this.getVisible();
  "textBox" == this.parent.objectType && (a.colour = this.getColour(), a.text = this.getText(), a.textAlign = this.getTextAlign(), a.lineBreak = this.getLineBreak(), a.bgColor = this.getBGColour(), a.underLine = this.getUnderLine(), a.strike = this.getStrike(), a.fontSize = this.getFontSize());
  return a;
};
Entry.EntityObject.prototype.setInitialEffectValue = function() {
  this.effect = this.getInitialEffectValue();
  Entry.requestUpdate = !0;
};
Entry.EntityObject.prototype.getInitialEffectValue = function() {
  return {blur:0, hue:0, hsv:0, brightness:0, contrast:0, saturation:0, alpha:1};
};
Entry.EntityObject.prototype.removeBrush = function() {
  Entry.stage.selectedObjectContainer.removeChild(this.shape);
  this.shape = this.brush = null;
};
Entry.EntityObject.prototype.updateBG = function() {
  if (this.bgObject) {
    this.bgObject.graphics.clear();
    var a = this.getWidth(), b = this.getHeight();
    this.bgObject.graphics.setStrokeStyle(1).beginStroke().beginFill(this.getBGColour()).drawRect(-a / 2, -b / 2, a, b);
    if (this.getLineBreak()) {
      this.bgObject.x = 0;
    } else {
      switch(this.getTextAlign()) {
        case Entry.TEXT_ALIGN_LEFT:
          this.bgObject.x = a / 2;
          break;
        case Entry.TEXT_ALIGN_CENTER:
          this.bgObject.x = 0;
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          this.bgObject.x = -a / 2;
      }
    }
  }
};
Entry.EntityObject.prototype.alignTextBox = function() {
  if ("textBox" == this.type) {
    var a = this.textObject;
    if (this.lineBreak) {
      var b = a.getMeasuredLineHeight();
      a.y = b / 2 - this.getHeight() / 2;
      switch(this.textAlign) {
        case Entry.TEXT_ALIGN_CENTER:
          a.x = 0;
          break;
        case Entry.TEXT_ALIGN_LEFT:
          a.x = -this.getWidth() / 2;
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          a.x = this.getWidth() / 2;
      }
      a.maxHeight = this.getHeight();
    } else {
      a.x = 0, a.y = 0;
    }
  }
};
Entry.EntityObject.prototype.syncDialogVisible = function() {
  this.dialog && (this.dialog.object.visible = this.visible);
};
Entry.Extension = function() {
};
(function(a) {
  a.renderView = function() {
  };
  a.toggleInformation = function() {
  };
})(Entry.Extension.prototype);
Entry.TargetChecker = function(a, b) {
  this.isForEdit = b;
  this.goals = [];
  this.unachievedGoals = [];
  this.isForEdit && (this.watchingBlocks = [], Entry.playground.mainWorkspace.blockMenu.unbanClass("checker"));
  this.isSuccess = this.isFail = !1;
  this.entity = this;
  this.parent = this;
  Entry.achieve = this.achieveCheck.bind(this);
  Entry.achieveEvent = new Entry.Event;
  Entry.addEventListener("stop", this.reset.bind(this));
  Entry.registerAchievement = this.registerAchievement.bind(this);
  this.script = new Entry.Code(a ? a : [], this);
};
Entry.Utils.inherit(Entry.Extension, Entry.TargetChecker);
(function(a) {
  a.renderView = function() {
    this._view = Entry.Dom("li", {class:"targetChecker"});
    this._view.bindOnClick(function(b) {
      Entry.playground.injectObject(this);
    }.bind(this));
    this.updateView();
    return this._view;
  };
  a.updateView = function() {
    if (this._view) {
      var b = this.goals.length;
      this._view.text("\ubaa9\ud45c : " + (b - this.unachievedGoals.length) + " / " + b);
      this.isSuccess ? this._view.addClass("success") : this._view.removeClass("success");
      this.isFail ? this._view.addClass("fail") : this._view.removeClass("fail");
    }
  };
  a.achieveCheck = function(b, a) {
    this.isFail || (b ? this.achieveGoal(a) : this.fail(a));
  };
  a.achieveGoal = function(b) {
    this.isSuccess || this.isFail || 0 > this.unachievedGoals.indexOf(b) || (this.unachievedGoals.splice(this.unachievedGoals.indexOf(b), 1), 0 === this.unachievedGoals.length && (this.isSuccess = !0, Entry.achieveEvent.notify("success")), this.updateView());
  };
  a.fail = function() {
    this.isSuccess || this.isFail || (this.isFail = !0, Entry.achieveEvent.notify("fail"), this.updateView());
  };
  a.reset = function() {
    this.unachievedGoals = this.goals.concat();
    this.isSuccess = this.isFail = !1;
    this.updateView();
  };
  a.registerAchievement = function(b) {
    this.isForEdit && this.watchingBlocks.push(b);
    b.params[1] && this.goals.indexOf(0 > b.params[0]) && this.goals.push(b.params[0]);
    this.reset();
  };
  a.clearExecutor = function() {
    this.script.clearExecutors();
  };
})(Entry.TargetChecker.prototype);
Entry.Func = function(a) {
  this.id = a ? a.id : Entry.generateHash();
  this.content = a ? new Entry.Code(a.content) : new Entry.Code([[{type:"function_create", copyable:!1, deletable:!1, x:40, y:40}]]);
  this._backupContent = this.blockMenuBlock = this.block = null;
  this.hashMap = {};
  this.paramMap = {};
  Entry.generateFunctionSchema(this.id);
  if (a) {
    a = this.content._blockMap;
    for (var b in a) {
      Entry.Func.registerParamBlock(a[b].type);
    }
    Entry.Func.generateWsBlock(this);
  }
  Entry.Func.registerFunction(this);
  Entry.Func.updateMenu();
};
Entry.Func.threads = {};
Entry.Func.registerFunction = function(a) {
  if (Entry.playground) {
    var b = Entry.playground.mainWorkspace;
    b && (this._targetFuncBlock = b.getBlockMenu().getCategoryCodes("func").createThread([{type:"func_" + a.id}]), a.blockMenuBlock = this._targetFuncBlock);
  }
};
Entry.Func.executeFunction = function(a) {
  var b = this.threads[a];
  if (b = Entry.Engine.computeThread(b.entity, b)) {
    return this.threads[a] = b, !0;
  }
  delete this.threads[a];
  return !1;
};
Entry.Func.clearThreads = function() {
  this.threads = {};
};
Entry.Func.prototype.init = function(a) {
  this.id = a.id;
  this.content = Blockly.Xml.textToDom(a.content);
  this.block = Blockly.Xml.textToDom("<xml>" + a.block + "</xml>").childNodes[0];
};
Entry.Func.prototype.destroy = function() {
  this.blockMenuBlock.destroy();
};
Entry.Func.edit = function(a) {
  this.unbindFuncChangeEvent();
  this.unbindWorkspaceStateChangeEvent();
  this.cancelEdit();
  Entry.Func.isEdit = !0;
  this.targetFunc = a;
  this.initEditView(a.content);
  this.bindFuncChangeEvent();
  this.updateMenu();
  setTimeout(function() {
    this._backupContent = a.content.stringify();
  }.bind(this), 0);
};
Entry.Func.initEditView = function(a) {
  this.menuCode || this.setupMenuCode();
  var b = Entry.playground.mainWorkspace;
  b.setMode(Entry.Workspace.MODE_OVERLAYBOARD);
  b.changeOverlayBoardCode(a);
  a.recreateView();
  b.changeOverlayBoardCode(a);
  this._workspaceStateEvent = b.changeEvent.attach(this, this.endEdit);
  a.view.reDraw();
  a.view.board.alignThreads();
};
Entry.Func.endEdit = function(a) {
  this.unbindFuncChangeEvent();
  this.unbindWorkspaceStateChangeEvent();
  switch(a) {
    case "save":
      this.save();
      break;
    case "cancelEdit":
      this.cancelEdit();
  }
  this._backupContent = null;
  delete this.targetFunc;
  this.updateMenu();
  Entry.Func.isEdit = !1;
};
Entry.Func.save = function() {
  this.targetFunc.generateBlock(!0);
  Entry.variableContainer.saveFunction(this.targetFunc);
};
Entry.Func.syncFuncName = function(a) {
  var b = 0;
  a = a.split(" ");
  var c = "", d;
  d = Blockly.mainWorkspace.getAllBlocks();
  for (var e = 0;e < d.length;e++) {
    var f = d[e];
    if ("function_general" === f.type) {
      for (var f = f.inputList, g = 0;g < f.length;g++) {
        var h = f[g];
        0 < h.fieldRow.length && h.fieldRow[0] instanceof Blockly.FieldLabel && void 0 != h.fieldRow[0].text_ && (c += h.fieldRow[0].text_, c += " ");
      }
      c = c.trim();
      if (c === this.srcFName && this.srcFName.split(" ").length == a.length) {
        for (c = 0;c < f.length;c++) {
          if (h = f[c], 0 < h.fieldRow.length && h.fieldRow[0] instanceof Blockly.FieldLabel && void 0 != h.fieldRow[0].text_) {
            if (void 0 === a[b]) {
              f.splice(c, 1);
              break;
            } else {
              h.fieldRow[0].text_ = a[b];
            }
            b++;
          }
        }
      }
      c = "";
      b = 0;
    }
  }
  b = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  Blockly.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, b);
};
Entry.Func.cancelEdit = function() {
  this.targetFunc && (this.targetFunc.block ? this._backupContent && (this.targetFunc.content.load(this._backupContent), Entry.generateFunctionSchema(this.targetFunc.id), Entry.Func.generateWsBlock(this.targetFunc)) : (this._targetFuncBlock.destroy(), delete Entry.variableContainer.functions_[this.targetFunc.id], delete Entry.variableContainer.selected), Entry.variableContainer.updateList());
};
Entry.Func.getMenuXml = function() {
  var a = [];
  this.targetFunc || (a = a.concat(this.createBtn));
  if (this.targetFunc) {
    var b = this.FIELD_BLOCK, b = b.replace("#1", Entry.generateHash()), b = b.replace("#2", Entry.generateHash()), b = Blockly.Xml.textToDom(b).childNodes, a = a.concat(Entry.nodeListToArray(b));
  }
  for (var c in Entry.variableContainer.functions_) {
    b = Entry.variableContainer.functions_[c], b === this.targetFunc ? (b = Entry.Func.generateBlock(this.targetFunc, Blockly.Xml.workspaceToDom(Entry.Func.workspace), b.id).block, a.push(b)) : a.push(b.block);
  }
  return a;
};
Entry.Func.syncFunc = function() {
  var a = Entry.Func;
  if (a.targetFunc) {
    var b = a.workspace.topBlocks_[0].toString(), c = a.workspace.topBlocks_.length;
    (a.fieldText != b || a.workspaceLength != c) && 1 > Blockly.Block.dragMode_ && (a.updateMenu(), a.fieldText = b, a.workspaceLength = c);
  }
};
Entry.Func.setupMenuCode = function() {
  var a = Entry.playground.mainWorkspace;
  a && (a = a.getBlockMenu().getCategoryCodes("func"), this._fieldLabel = a.createThread([{type:"function_field_label"}]).getFirstBlock(), this._fieldString = a.createThread([{type:"function_field_string", params:[{type:this.requestParamBlock("string")}]}]).getFirstBlock(), this._fieldBoolean = a.createThread([{type:"function_field_boolean", params:[{type:this.requestParamBlock("boolean")}]}]).getFirstBlock(), this.menuCode = a);
};
Entry.Func.refreshMenuCode = function() {
  if (Entry.playground.mainWorkspace) {
    this.menuCode || this.setupMenuCode();
    var a = Entry.block[this._fieldString.params[0].type].changeEvent._listeners.length;
    2 < a && this._fieldString.params[0].changeType(this.requestParamBlock("string"));
    a = Entry.block[this._fieldBoolean.params[0].type].changeEvent._listeners.length;
    2 < a && this._fieldBoolean.params[0].changeType(this.requestParamBlock("boolean"));
  }
};
Entry.Func.requestParamBlock = function(a) {
  var b = Entry.generateHash(), c;
  switch(a) {
    case "string":
      c = Entry.block.function_param_string;
      break;
    case "boolean":
      c = Entry.block.function_param_boolean;
      break;
    default:
      return null;
  }
  b = a + "Param_" + b;
  a = Entry.Func.createParamBlock(b, c, a);
  Entry.block[b] = a;
  return b;
};
Entry.Func.registerParamBlock = function(a) {
  -1 < a.indexOf("stringParam") ? Entry.Func.createParamBlock(a, Entry.block.function_param_string, a) : -1 < a.indexOf("booleanParam") && Entry.Func.createParamBlock(a, Entry.block.function_param_boolean, a);
};
Entry.Func.createParamBlock = function(a, b, c) {
  var d = function() {
  };
  c = "string" === c ? "function_param_string" : "function_param_boolean";
  d.prototype = b;
  d = new d;
  d.changeEvent = new Entry.Event;
  d.template = Lang.template[c];
  return Entry.block[a] = d;
};
Entry.Func.updateMenu = function() {
  if (Entry.playground && Entry.playground.mainWorkspace) {
    var a = Entry.playground.mainWorkspace.getBlockMenu();
    this.targetFunc ? (this.menuCode || this.setupMenuCode(), a.banClass("functionInit", !0), a.unbanClass("functionEdit", !0)) : (a.unbanClass("functionInit", !0), a.banClass("functionEdit", !0));
    a.reDraw();
  }
};
Entry.Func.prototype.edit = function() {
  Entry.Func.isEdit || (Entry.Func.isEdit = !0, Entry.Func.svg ? this.parentView.appendChild(this.svg) : Entry.Func.initEditView());
};
Entry.Func.generateBlock = function(a) {
  a = Entry.block["func_" + a.id];
  var b = {template:a.template, params:a.params}, c = /(%\d)/mi, d = a.template.split(c), e = "", f = 0, g = 0, h;
  for (h in d) {
    var k = d[h];
    c.test(k) ? (k = Number(k.split("%")[1]) - 1, k = a.params[k], "Indicator" !== k.type && ("boolean" === k.accept ? (e += Lang.template.function_param_boolean + (f ? f : ""), f++) : (e += Lang.template.function_param_string + (g ? g : ""), g++))) : e += k;
  }
  return {block:b, description:e};
};
Entry.Func.prototype.generateBlock = function(a) {
  a = Entry.Func.generateBlock(this);
  this.block = a.block;
  this.description = a.description;
};
Entry.Func.generateWsBlock = function(a) {
  this.unbindFuncChangeEvent();
  a = a ? a : this.targetFunc;
  for (var b = a.content.getEventMap("funcDef")[0].params[0], c = 0, d = 0, e = [], f = "", g = a.hashMap, h = a.paramMap;b;) {
    var k = b.params[0];
    switch(b.type) {
      case "function_field_label":
        f = f + " " + k;
        break;
      case "function_field_boolean":
        Entry.Mutator.mutate(k.type, {template:Lang.Blocks.FUNCTION_logical_variable + " " + (c ? c : "")});
        g[k.type] = !1;
        h[k.type] = c + d;
        c++;
        e.push({type:"Block", accept:"boolean"});
        f += " %" + (c + d);
        break;
      case "function_field_string":
        Entry.Mutator.mutate(k.type, {template:Lang.Blocks.FUNCTION_character_variable + " " + (d ? d : "")}), g[k.type] = !1, h[k.type] = c + d, d++, f += " %" + (c + d), e.push({type:"Block", accept:"string"});
    }
    b = b.getOutputBlock();
  }
  c++;
  f += " %" + (c + d);
  e.push({type:"Indicator", img:"block_icon/function_03.png", size:12});
  b = "func_" + a.id;
  c = Entry.block[b];
  d = !1;
  if (c.template !== f) {
    d = !0;
  } else {
    if (c.params.length === e.length) {
      for (h = 0;h < c.params.length - 1;h++) {
        var k = c.params[h], m = e[h];
        if (k.type !== m.type || k.accept !== m.accept) {
          d = !0;
          break;
        }
      }
    }
  }
  d && Entry.Mutator.mutate(b, {params:e, template:f});
  for (var l in g) {
    g[l] ? (e = -1 < l.indexOf("string") ? Lang.Blocks.FUNCTION_character_variable : Lang.Blocks.FUNCTION_logical_variable, Entry.Mutator.mutate(l, {template:e})) : g[l] = !0;
  }
  this.bindFuncChangeEvent(a);
};
Entry.Func.bindFuncChangeEvent = function(a) {
  a = a ? a : this.targetFunc;
  !this._funcChangeEvent && a.content.getEventMap("funcDef")[0].view && (this._funcChangeEvent = a.content.getEventMap("funcDef")[0].view._contents[1].changeEvent.attach(this, this.generateWsBlock));
};
Entry.Func.unbindFuncChangeEvent = function() {
  this._funcChangeEvent && (this._funcChangeEvent.destroy(), delete this._funcChangeEvent);
};
Entry.Func.unbindWorkspaceStateChangeEvent = function() {
  this._workspaceStateEvent && (this._workspaceStateEvent.destroy(), delete this._workspaceStateEvent);
};
Entry.Helper = function() {
  this.visible = !1;
};
p = Entry.Helper.prototype;
p.generateView = function(a, b) {
  this.parentView_ || (this.parentView_ = a, this.blockHelpData = EntryStatic.blockInfo, this.view = a = Entry.createElement("div", "entryBlockHelperWorkspace"), Entry.isForLecture && a.addClass("lecture"), this.parentView_.appendChild(a), b = Entry.createElement("div", "entryBlockHelperContentWorkspace"), b.addClass("entryBlockHelperIntro"), Entry.isForLecture && b.addClass("lecture"), a.appendChild(b), this.blockHelperContent_ = b, this.blockHelperView_ = a, a = Entry.createElement("div", "entryBlockHelperBlockWorkspace"), 
  this.blockHelperContent_.appendChild(a), b = Entry.createElement("div", "entryBlockHelperDescriptionWorkspace"), this.blockHelperContent_.appendChild(b), b.innerHTML = Lang.Helper.Block_click_msg, this.blockHelperDescription_ = b, this._renderView = new Entry.RenderView($(a), "LEFT"), this.code = new Entry.Code([]), this._renderView.changeCode(this.code), this.first = !0);
};
p.bindWorkspace = function(a) {
  a && (this._blockViewObserver && this._blockViewObserver.destroy(), this.workspace = a, this._blockViewObserver = a.observe(this, "_updateSelectedBlock", ["selectedBlockView"]));
};
p._updateSelectedBlock = function() {
  var a = this.workspace.selectedBlockView;
  if (a && this.visible && a != this._blockView) {
    var b = a.block.type;
    this._blockView = a;
    this.renderBlock(b);
  }
};
p.renderBlock = function(a) {
  var b = Lang.Helper[a];
  if (a && this.visible && b && !Entry.block[a].isPrimitive) {
    this.first && (this.blockHelperContent_.removeClass("entryBlockHelperIntro"), this.first = !1);
    this.code.clear();
    var c = Entry.block[a].def, c = c || {type:a};
    this.code.createThread([c]);
    this.code.board.align();
    this.code.board.resize();
    var c = this.code.getThreads()[0].getFirstBlock().view, d = c.svgGroup.getBBox();
    a = d.width;
    d = d.height;
    c = c.getSkeleton().box(c).offsetX;
    isNaN(c) && (c = 0);
    this.blockHelperDescription_.innerHTML = b;
    this._renderView.align();
    $(this.blockHelperDescription_).css({top:d + 30});
    this._renderView.svgDom.css({"margin-left":-(a / 2) - 20 - c});
  }
};
p.getView = function() {
  return this.view;
};
p.resize = function() {
};
Entry.HWMontior = {};
Entry.HWMonitor = function(a) {
  this.svgDom = Entry.Dom($('<svg id="hwMonitor" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'));
  this._hwModule = a;
  var b = this;
  Entry.addEventListener("windowResized", function() {
    var a = b._hwModule.monitorTemplate.mode;
    "both" == a && (b.resize(), b.resizeList());
    "list" == a ? b.resizeList() : b.resize();
  });
  Entry.addEventListener("hwModeChange", function() {
    b.changeMode();
  });
  this.changeOffset = 0;
  this.scale = .5;
  this._listPortViews = {};
};
(function(a) {
  a.initView = function() {
    this.svgDom = Entry.Dom($('<svg id="hwMonitor" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'));
  };
  a.generateView = function() {
    this.snap = Entry.SVG("hwMonitor");
    this._svgGroup = this.snap.elem("g");
    this._portMap = {n:[], e:[], s:[], w:[]};
    var b = this._hwModule.monitorTemplate, a = {href:Entry.mediaFilePath + b.imgPath, x:-b.width / 2, y:-b.height / 2, width:b.width, height:b.height};
    this._portViews = {};
    this.hwView = this._svgGroup.elem("image");
    this.hwView = this.hwView.attr(a);
    this._template = b;
    b = b.ports;
    this.pathGroup = null;
    this.pathGroup = this._svgGroup.elem("g");
    var a = [], d;
    for (d in b) {
      var e = this.generatePortView(b[d], "_svgGroup");
      this._portViews[d] = e;
      a.push(e);
    }
    a.sort(function(b, a) {
      return b.box.x - a.box.x;
    });
    var f = this._portMap;
    a.map(function(b) {
      (1 > (Math.atan2(-b.box.y, b.box.x) / Math.PI + 2) % 2 ? f.n : f.s).push(b);
    });
    this.resize();
  };
  a.toggleMode = function(b) {
    var a = this._hwModule.monitorTemplate;
    "list" == b ? (a.TempPort = null, this._hwModule.monitorTemplate.ports && (this._hwModule.monitorTemplate.TempPort = this._hwModule.monitorTemplate.ports, this._hwModule.monitorTemplate.listPorts = this.addPortEle(this._hwModule.monitorTemplate.listPorts, this._hwModule.monitorTemplate.ports)), $(this._svglistGroup).remove(), this._svgGroup && $(this._svgGroup).remove(), $(this._pathGroup).remove(), this._hwModule.monitorTemplate.mode = "list", this.generateListView()) : (this._hwModule.monitorTemplate.TempPort && 
    (this._hwModule.monitorTemplate.ports = this._hwModule.monitorTemplate.TempPort, this._hwModule.monitorTemplate.listPorts = this.removePortEle(this._hwModule.monitorTemplate.listPorts, this._hwModule.monitorTemplate.ports)), $(this._svglistGroup).remove(), this._hwModule.monitorTemplate.mode = "both", this.generateListView(), this.generateView());
  };
  a.setHwmonitor = function(b) {
    this._hwmodule = b;
  };
  a.changeMode = function(b) {
    "both" == this._hwModule.monitorTemplate.mode ? this.toggleMode("list") : "list" == this._hwModule.monitorTemplate.mode && this.toggleMode("both");
  };
  a.addPortEle = function(b, a) {
    if ("object" != typeof a) {
      return b;
    }
    for (var c in a) {
      b[c] = a[c];
    }
    return b;
  };
  a.removePortEle = function(b, a) {
    if ("object" != typeof a) {
      return b;
    }
    for (var c in a) {
      delete b[c];
    }
    return b;
  };
  a.generateListView = function() {
    this._portMapList = {n:[]};
    this._svglistGroup = null;
    this.listsnap = Entry.SVG("hwMonitor");
    this._svglistGroup = this.listsnap.elem("g");
    var b = this._hwModule.monitorTemplate;
    this._template = b;
    b = b.listPorts;
    this.pathGroup = this._svglistGroup.elem("g");
    var a = [], d;
    for (d in b) {
      var e = this.generatePortView(b[d], "_svglistGroup");
      this._listPortViews[d] = e;
      a.push(e);
    }
    var f = this._portMapList;
    a.map(function(b) {
      f.n.push(b);
    });
    this.resizeList();
  };
  a.generatePortView = function(b, a) {
    a = this[a].elem("g");
    a.addClass("hwComponent");
    var c;
    c = this.pathGroup.elem("path").attr({d:"m0,0", fill:"none", stroke:"input" === b.type ? "#00979d" : "#A751E3", "stroke-width":3});
    var e = a.elem("rect").attr({x:0, y:0, width:150, height:22, rx:4, ry:4, fill:"#fff", stroke:"#a0a1a1"}), f = a.elem("text").attr({x:4, y:12, fill:"#000", "class":"hwComponentName", "alignment-baseline":"central"});
    f.textContent = b.name;
    f = f.getComputedTextLength();
    a.elem("rect").attr({x:f + 8, y:2, width:30, height:18, rx:9, ry:9, fill:"input" === b.type ? "#00979d" : "#A751E3"});
    var g = a.elem("text").attr({x:f + 13, y:12, fill:"#fff", "class":"hwComponentValue", "alignment-baseline":"central"});
    g.textContent = 0;
    f += 40;
    e.attr({width:f});
    return {group:a, value:g, type:b.type, path:c, box:{x:b.pos.x - this._template.width / 2, y:b.pos.y - this._template.height / 2, width:f}, width:f};
  };
  a.getView = function() {
    return this.svgDom;
  };
  a.update = function() {
    var b = Entry.hw.portData, a = Entry.hw.sendQueue, d = this._hwModule.monitorTemplate.mode, e = this._hwModule.monitorTemplate.keys || [], f = [];
    if ("list" == d) {
      f = this._listPortViews;
    } else {
      if ("both" == d) {
        if (f = this._listPortViews, this._portViews) {
          for (var g in this._portViews) {
            f[g] = this._portViews[g];
          }
        }
      } else {
        f = this._portViews;
      }
    }
    if (a) {
      for (g in a) {
        0 != a[g] && f[g] && (f[g].type = "output");
      }
    }
    for (var h in f) {
      if (d = f[h], "input" == d.type) {
        var k = b[h];
        0 < e.length && $.each(e, function(b, a) {
          if ($.isPlainObject(k)) {
            k = k[a] || 0;
          } else {
            return !1;
          }
        });
        d.value.textContent = k ? k : 0;
        d.group.getElementsByTagName("rect")[1].attr({fill:"#00979D"});
      } else {
        k = a[h], 0 < e.length && $.each(e, function(b, a) {
          if ($.isPlainObject(k)) {
            k = k[a] || 0;
          } else {
            return !1;
          }
        }), d.value.textContent = k ? k : 0, d.group.getElementsByTagName("rect")[1].attr({fill:"#A751E3"});
      }
    }
  };
  a.resize = function() {
    this.hwView && this.hwView.attr({transform:"scale(" + this.scale + ")"});
    if (this.svgDom) {
      var b = this.svgDom.get(0).getBoundingClientRect();
    }
    this._svgGroup.attr({transform:"translate(" + b.width / 2 + "," + b.height / 1.8 + ")"});
    this._rect = b;
    0 >= this._template.height || 0 >= b.height || (this.scale = b.height / this._template.height * this._template.height / 1E3, this.align());
  };
  a.resizeList = function() {
    var b = this.svgDom.get(0).getBoundingClientRect();
    this._svglistGroup.attr({transform:"translate(" + b.width / 2 + "," + b.height / 2 + ")"});
    this._rect = b;
    this.alignList();
  };
  a.align = function() {
    var b;
    b = this._portMap.s.concat();
    this._alignNS(b, this.scale / 3 * this._template.height + 5, 27);
    b = this._portMap.n.concat();
    this._alignNS(b, -this._template.height * this.scale / 3 - 32, -27);
    b = this._portMap.e.concat();
    this._alignEW(b, -this._template.width * this.scale / 3 - 5, -27);
    b = this._portMap.w.concat();
    this._alignEW(b, this._template.width * this.scale / 3 - 32, -27);
  };
  a.alignList = function() {
    var b;
    b = this._hwModule.monitorTemplate.listPorts;
    for (var a = b.length, d = 0;d < b.length;d++) {
      b[d].group.attr({transform:"translate(" + this._template.width * (d / a - .5) + "," + (-this._template.width / 2 - 30) + ")"});
    }
    b = this._portMapList.n.concat();
    this._alignNSList(b, -this._template.width * this.scale / 2 - 32, -27);
  };
  a._alignEW = function(b, a, d) {
    var c = b.length, f = this._rect.height - 50;
    tP = -f / 2;
    bP = f / 2;
    height = this._rect.height;
    listVLine = wholeHeight = 0;
    mode = this._hwModule.monitorTemplate;
    for (f = 0;f < c;f++) {
      wholeHeight += b[f].height + 5;
    }
    wholeHeight < bP - tP && (bP = wholeHeight / 2 + 3, tP = -wholeHeight / 2 - 3);
    for (;1 < c;) {
      var g = b.shift(), f = b.pop(), h = tP, k = bP, m = d;
      wholeWidth <= bP - tP ? (tP += g.width + 5, bP -= f.width + 5, m = 0) : 0 === b.length ? (tP = (tP + bP) / 2 - 3, bP = tP + 6) : (tP = Math.max(tP, -width / 2 + g.width) + 15, bP = Math.min(bP, width / 2 - f.width) - 15);
      wholeWidth -= g.width + f.width + 10;
      a += m;
    }
    b.length && b[0].group.attr({transform:"translate(" + a + ",60)"});
    g && rPort && (this._movePort(g, a, tP, h), this._movePort(rPort, a, bP, k));
  };
  a._alignNS = function(b, a, d) {
    for (var c = -this._rect.width / 2, f = this._rect.width / 2, g = this._rect.width, h = 0, k = 0;k < b.length;k++) {
      h += b[k].width + 5;
    }
    h < f - c && (f = h / 2 + 3, c = -h / 2 - 3);
    for (;1 < b.length;) {
      var k = b.shift(), m = b.pop(), l = c, n = f, q = d;
      h <= f - c ? (c += k.width + 5, f -= m.width + 5, q = 0) : 0 === b.length ? (c = (c + f) / 2 - 3, f = c + 6) : (c = Math.max(c, -g / 2 + k.width) + 15, f = Math.min(f, g / 2 - m.width) - 15);
      this._movePort(k, c, a, l);
      this._movePort(m, f, a, n);
      h -= k.width + m.width + 10;
      a += q;
    }
    b.length && this._movePort(b[0], (f + c - b[0].width) / 2, a, 100);
  };
  a._alignNSList = function(b, a) {
    a = this._rect.width;
    initX = -this._rect.width / 2 + 10;
    initY = -this._rect.height / 2 + 10;
    for (var c = listLine = wholeWidth = 0;c < b.length;c++) {
      wholeWidth += b[c].width;
    }
    for (var e = 0, f = 0, g = initX, h, k, m = 0, c = 0;c < b.length;c++) {
      k = b[c], c != b.length - 1 && (m = b[c + 1]), f += k.width, lP = initX, h = initY + 30 * e, k.group.attr({transform:"translate(" + lP + "," + h + ")"}), initX += k.width + 10, f > a - (k.width + m.width / 2.2) && (e += 1, initX = g, f = 0);
    }
  };
  a._movePort = function(b, a, d, e) {
    var c = a, g = b.box.x * this.scale, h = b.box.y * this.scale;
    a > e ? (c = a - b.width, a = a > g && g > e ? "M" + g + "," + d + "L" + g + "," + h : "M" + (a + e) / 2 + "," + d + "l0," + (h > d ? 28 : -3) + "H" + g + "L" + g + "," + h) : a = a < g && g < e ? "m" + g + "," + d + "L" + g + "," + h : "m" + (e + a) / 2 + "," + d + "l0," + (h > d ? 28 : -3) + "H" + g + "L" + g + "," + h;
    b.group.attr({transform:"translate(" + c + "," + d + ")"});
    b.path.attr({d:a});
  };
})(Entry.HWMonitor.prototype);
Entry.HW = function() {
  this.sessionRoomId = localStorage.getItem("entryhwRoomId");
  this.sessionRoomId || (this.sessionRoomId = this.createRandomRoomId(), localStorage.setItem("entryhwRoomId", this.sessionRoomId));
  this.connectTrial = 0;
  this.isFirstConnect = !0;
  this.requireVerion = "v1.6.1";
  this.downloadPath = "http://download.play-entry.org/apps/Entry_HW_1.6.2_Setup.exe";
  this.hwPopupCreate();
  this.initSocket();
  this.connected = !1;
  this.portData = {};
  this.sendQueue = {};
  this.outputQueue = {};
  this.settingQueue = {};
  this.socketType = this.hwModule = this.selectedDevice = null;
  Entry.addEventListener("stop", this.setZero);
  this.hwInfo = {"1.1":Entry.Arduino, "1.9":Entry.ArduinoExt, "1.2":Entry.SensorBoard, "1.3":Entry.CODEino, "1.4":Entry.joystick, "1.5":Entry.dplay, "1.6":Entry.nemoino, "1.7":Entry.Xbot, "1.8":Entry.ardublock, "1.A":Entry.Cobl, "2.4":Entry.Hamster, "2.5":Entry.Albert, "3.1":Entry.Bitbrick, "4.2":Entry.Arduino, "5.1":Entry.Neobot, "7.1":Entry.Robotis_carCont, "7.2":Entry.Robotis_openCM70, "8.1":Entry.Arduino, "10.1":Entry.Roborobo_Roduino, "10.2":Entry.Roborobo_SchoolKit, "12.1":Entry.EV3, "B.1":Entry.Codestar, 
  "A.1":Entry.SmartBoard};
};
Entry.HW.TRIAL_LIMIT = 2;
p = Entry.HW.prototype;
p.createRandomRoomId = function() {
  return "xxxxxxxxyx".replace(/[xy]/g, function(a) {
    var b = 16 * Math.random() | 0;
    return ("x" == a ? b : b & 3 | 8).toString(16);
  });
};
p.connectWebSocket = function(a, b) {
  var c = this, d = io(a, b);
  d.io.reconnectionAttempts(Entry.HW.TRIAL_LIMIT);
  d.io.reconnectionDelayMax(1E3);
  d.io.timeout(1E3);
  d.on("connect", function() {
    c.socketType = "WebSocket";
    c.initHardware(d);
  });
  d.on("mode", function(b) {
    0 === d.mode && 1 === b && c.disconnectHardware();
    c.socketMode = b;
    d.mode = b;
  });
  d.on("message", function(b) {
    if (b.data && "string" === typeof b.data) {
      switch(b.data) {
        case "disconnectHardware":
          c.disconnectHardware();
          break;
        default:
          var a = JSON.parse(b.data);
          c.checkDevice(a, b.version);
          c.updatePortData(a);
      }
    }
  });
  d.on("disconnect", function() {
    c.initSocket();
  });
  return d;
};
p.initSocket = function() {
  try {
    this.connected = !1;
    this.tlsSocketIo && this.tlsSocketIo.removeAllListeners();
    this.socketIo && this.socketIo.removeAllListeners();
    this.isOpenHardware || this.checkOldClient();
    if (-1 < location.protocol.indexOf("https")) {
      this.tlsSocketIo = this.connectWebSocket("https://hardware.play-entry.org:23518", {query:{client:!0, roomId:this.sessionRoomId}});
    } else {
      try {
        this.socketIo = this.connectWebSocket("http://127.0.0.1:23518", {query:{client:!0, roomId:this.sessionRoomId}});
      } catch (a) {
      }
      try {
        this.tlsSocketIo = this.connectWebSocket("https://hardware.play-entry.org:23518", {query:{client:!0, roomId:this.sessionRoomId}});
      } catch (a) {
      }
    }
    Entry.dispatchEvent("hwChanged");
  } catch (a) {
  }
};
p.checkOldClient = function() {
  try {
    var a = this, b = new WebSocket("wss://hardware.play-entry.org:23518");
    b.onopen = function() {
      a.popupHelper.show("newVersion", !0);
      b.close();
    };
  } catch (c) {
  }
};
p.retryConnect = function() {
  this.isOpenHardware = !1;
  Entry.HW.TRIAL_LIMIT = 5;
  this.initSocket();
};
p.openHardwareProgram = function() {
  this.isOpenHardware = !0;
  Entry.HW.TRIAL_LIMIT = 5;
  this.socket ? this.executeHardware() : (this.executeHardware(), this.initSocket());
};
p.initHardware = function(a) {
  this.socket = a;
  this.connectTrial = 0;
  this.connected = !0;
  Entry.dispatchEvent("hwChanged");
  Entry.playground && Entry.playground.object && Entry.playground.setMenu(Entry.playground.object.objectType);
};
p.disconnectHardware = function() {
  Entry.propertyPanel.removeMode("hw");
  this.hwModule = this.selectedDevice = void 0;
  Entry.dispatchEvent("hwChanged");
};
p.disconnectedSocket = function() {
  this.tlsSocketIo.close();
  this.socketIo && this.socketIo.close();
  Entry.propertyPanel.removeMode("hw");
  this.socket = void 0;
  this.connectTrial = 0;
  this.connected = !1;
  this.hwModule = this.selectedDevice = void 0;
  Entry.dispatchEvent("hwChanged");
  Entry.toast.alert("\ud558\ub4dc\uc6e8\uc5b4 \ud504\ub85c\uadf8\ub7a8 \uc5f0\uacb0 \uc885\ub8cc", "\ud558\ub4dc\uc6e8\uc5b4 \ud504\ub85c\uadf8\ub7a8\uacfc\uc758 \uc5f0\uacb0\uc774 \uc885\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4.", !1);
};
p.setDigitalPortValue = function(a, b) {
  this.sendQueue[a] = b;
  this.removePortReadable(a);
};
p.getAnalogPortValue = function(a) {
  return this.connected ? this.portData["a" + a] : 0;
};
p.getDigitalPortValue = function(a) {
  if (!this.connected) {
    return 0;
  }
  this.setPortReadable(a);
  return void 0 !== this.portData[a] ? this.portData[a] : 0;
};
p.setPortReadable = function(a) {
  this.sendQueue.readablePorts || (this.sendQueue.readablePorts = []);
  var b = !1, c;
  for (c in this.sendQueue.readablePorts) {
    if (this.sendQueue.readablePorts[c] == a) {
      b = !0;
      break;
    }
  }
  b || this.sendQueue.readablePorts.push(a);
};
p.removePortReadable = function(a) {
  if (this.sendQueue.readablePorts || Array.isArray(this.sendQueue.readablePorts)) {
    var b, c;
    for (c in this.sendQueue.readablePorts) {
      if (this.sendQueue.readablePorts[c] == a) {
        b = Number(c);
        break;
      }
    }
    this.sendQueue.readablePorts = void 0 != b ? this.sendQueue.readablePorts.slice(0, b).concat(this.sendQueue.readablePorts.slice(b + 1, this.sendQueue.readablePorts.length)) : [];
  }
};
p.update = function() {
  this.socket && (this.socket.disconnected || this.socket.emit("message", {data:JSON.stringify(this.sendQueue), mode:this.socket.mode, type:"utf8"}));
};
p.updatePortData = function(a) {
  this.portData = a;
  this.hwMonitor && "hw" == Entry.propertyPanel.selected && this.hwMonitor.update();
};
p.closeConnection = function() {
  this.socket && this.socket.close();
};
p.downloadConnector = function() {
  window.open(this.downloadPath, "_blank").focus();
};
p.downloadGuide = function() {
  var a = document.createElement("a");
  a.href = "http://download.play-entry.org/data/%EC%97%94%ED%8A%B8%EB%A6%AC%20%ED%95%98%EB%93%9C%EC%9B%A8%EC%96%B4%20%EC%97%B0%EA%B2%B0%20%EB%A7%A4%EB%89%B4%EC%96%BC(%EC%98%A8%EB%9D%BC%EC%9D%B8%EC%9A%A9).pdf";
  a.download = "download";
  a.click();
};
p.downloadSource = function() {
  window.open("http://play-entry.com/down/board.ino", "_blank").focus();
};
p.setZero = function() {
  Entry.hw.hwModule && Entry.hw.hwModule.setZero();
};
p.checkDevice = function(a, b) {
  void 0 !== a.company && (a = [Entry.Utils.convertIntToHex(a.company), ".", Entry.Utils.convertIntToHex(a.model)].join(""), a != this.selectedDevice && (Entry.Utils.isNewVersion(b, this.requireVerion) && this.popupHelper.show("newVersion", !0), this.selectedDevice = a, this.hwModule = this.hwInfo[a], Entry.dispatchEvent("hwChanged"), Entry.toast.success("\ud558\ub4dc\uc6e8\uc5b4 \uc5f0\uacb0 \uc131\uacf5", "\ud558\ub4dc\uc6e8\uc5b4 \uc544\uc774\ucf58\uc744 \ub354\ube14\ud074\ub9ad\ud558\uba74, \uc13c\uc11c\uac12\ub9cc \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.", 
  !1), this.hwModule.monitorTemplate && (this.hwMonitor ? (this.hwMonitor._hwModule = this.hwModule, this.hwMonitor.initView()) : this.hwMonitor = new Entry.HWMonitor(this.hwModule), Entry.propertyPanel.addMode("hw", this.hwMonitor), b = this.hwModule.monitorTemplate, "both" == b.mode ? (b.mode = "list", this.hwMonitor.generateListView(), b.mode = "general", this.hwMonitor.generateView(), b.mode = "both") : "list" == b.mode ? this.hwMonitor.generateListView() : this.hwMonitor.generateView())));
};
p.banHW = function() {
  var a = this.hwInfo, b;
  for (b in a) {
    Entry.playground.mainWorkspace.blockMenu.banClass(a[b].name, !0);
  }
};
p.executeHardware = function() {
  function a(b) {
    navigator.msLaunchUri(b, function() {
    }, function() {
      d.popupHelper.show("hwDownload", !0);
    });
  }
  function b(b) {
    var a = document.createElement("iframe");
    a.src = "about:blank";
    a.style = "display:none";
    document.getElementsByTagName("body")[0].appendChild(a);
    var c = null, c = setTimeout(function() {
      var e = !1;
      try {
        a.contentWindow.location.href = b, e = !0;
      } catch (l) {
        "NS_ERROR_UNKNOWN_PROTOCOL" == l.name && (e = !1);
      }
      e || d.popupHelper.show("hwDownload", !0);
      document.getElementsByTagName("body")[0].removeChild(a);
      clearTimeout(c);
    }, 500);
  }
  function c(b) {
    var a = !1;
    window.focus();
    window.onblur = function() {
      a = !0;
    };
    location.assign(encodeURI(b));
    setTimeout(function() {
      (0 == a || 0 < navigator.userAgent.indexOf("Edge")) && d.popupHelper.show("hwDownload", !0);
      window.onblur = null;
    }, 1500);
  }
  var d = this, e = {_bNotInstalled:!1, init:function(b, a) {
    this._w = window.open("/views/hwLoading.html", "entry_hw_launcher", "width=220, height=225,  top=" + window.screenTop + ", left=" + window.screenLeft);
    var c = null, c = setTimeout(function() {
      e.runViewer(b, a);
      clearInterval(c);
    }, 1E3);
  }, runViewer:function(b, a) {
    this._w.document.write("<iframe src='" + b + "' onload='opener.Entry.hw.ieLauncher.set()' style='display:none;width:0;height:0'></iframe>");
    var c = 0, d = null, d = setInterval(function() {
      try {
        this._w.location.href;
      } catch (q) {
        this._bNotInstalled = !0;
      }
      if (10 < c) {
        clearInterval(d);
        var b = 0, e = null, e = setInterval(function() {
          b++;
          this._w.closed || 2 < b ? clearInterval(e) : this._w.close();
          this._bNotInstalled = !1;
          c = 0;
        }.bind(this), 5E3);
        a(!this._bNotInstalled);
      }
      c++;
    }.bind(this), 100);
  }, set:function() {
    this._bNotInstalled = !0;
  }};
  d.ieLauncher = e;
  var f = "entryhw://-roomId:" + this.sessionRoomId;
  0 < navigator.userAgent.indexOf("MSIE") || 0 < navigator.userAgent.indexOf("Trident") ? void 0 != navigator.msLaunchUri ? a(f) : 9 > (0 < document.documentMode ? document.documentMode : navigator.userAgent.match(/(?:MSIE) ([0-9.]+)/)[1]) ? alert(Lang.msgs.not_support_browser) : e.init(f, function(b) {
    0 == b && d.popupHelper.show("hwDownload", !0);
  }) : 0 < navigator.userAgent.indexOf("Firefox") ? b(f) : 0 < navigator.userAgent.indexOf("Chrome") || 0 < navigator.userAgent.indexOf("Safari") ? c(f) : alert(Lang.msgs.not_support_browser);
};
p.hwPopupCreate = function() {
  var a = this;
  this.popupHelper || (this.popupHelper = window.popupHelper ? window.popupHelper : new Entry.popupHelper(!0));
  this.popupHelper.addPopup("newVersion", {type:"confirm", title:Lang.Msgs.new_version_title, setPopupLayout:function(b) {
    var c = Entry.Dom("div", {class:"contentArea"}), d = Entry.Dom("div", {class:"textArea", parent:c}), e = Entry.Dom("div", {class:"text1", parent:d}), f = Entry.Dom("div", {class:"text2", parent:d}), g = Entry.Dom("div", {class:"text3", parent:d}), d = Entry.Dom("div", {class:"text4", parent:d}), h = Entry.Dom("div", {classes:["popupCancelBtn", "popupDefaultBtn"], parent:c}), k = Entry.Dom("div", {classes:["popupOkBtn", "popupDefaultBtn"], parent:c});
    e.text(Lang.Msgs.new_version_text1);
    f.html(Lang.Msgs.new_version_text2);
    g.text(Lang.Msgs.new_version_text3);
    d.text(Lang.Msgs.new_version_text4);
    h.text(Lang.Buttons.cancel);
    k.html(Lang.Msgs.new_version_download);
    c.bindOnClick(".popupDefaultBtn", function(b) {
      $(this).hasClass("popupOkBtn") ? a.downloadConnector() : a.popupHelper.hide("newVersion");
    });
    b.append(c);
  }});
  this.popupHelper.addPopup("hwDownload", {type:"confirm", title:Lang.Msgs.not_install_title, setPopupLayout:function(b) {
    var c = Entry.Dom("div", {class:"contentArea"}), d = Entry.Dom("div", {class:"textArea", parent:c}), e = Entry.Dom("div", {class:"text1", parent:d}), f = Entry.Dom("div", {class:"text2", parent:d}), g = Entry.Dom("div", {class:"text3", parent:d}), d = Entry.Dom("div", {class:"text4", parent:d}), h = Entry.Dom("div", {classes:["popupCancelBtn", "popupDefaultBtn"], parent:c}), k = Entry.Dom("div", {classes:["popupOkBtn", "popupDefaultBtn"], parent:c});
    e.text(Lang.Msgs.hw_download_text1);
    f.html(Lang.Msgs.hw_download_text2);
    g.text(Lang.Msgs.hw_download_text3);
    d.text(Lang.Msgs.hw_download_text4);
    h.text(Lang.Buttons.cancel);
    k.html(Lang.Msgs.hw_download_btn);
    c.bindOnClick(".popupDefaultBtn", function(b) {
      $(this).hasClass("popupOkBtn") ? a.downloadConnector() : a.popupHelper.hide("hwDownload");
    });
    b.append(c);
  }});
};
Entry.PropertyPanel = function() {
  this.modes = {};
  this.selected = null;
};
(function(a) {
  a.generateView = function(b, a) {
    this._view = Entry.Dom("div", {class:"propertyPanel", parent:$(b)});
    this._tabView = Entry.Dom("div", {class:"propertyTab", parent:this._view});
    this._contentView = Entry.Dom("div", {class:"propertyContent", parent:this._view});
    this._cover = Entry.Dom("div", {classes:["propertyPanelCover", "entryRemove"], parent:this._view});
    b = Entry.Dom("div", {class:"entryObjectSelectedImgWorkspace", parent:this._view});
    this.initializeSplitter(b);
  };
  a.addMode = function(b, a) {
    var c = a.getView(), c = Entry.Dom(c, {parent:this._contentView}), e = Entry.Dom("<div>" + Lang.Menus[b] + "</div>", {classes:["propertyTabElement", "propertyTab" + b], parent:this._tabView}), f = this;
    e.bind("click", function() {
      f.select(b);
    });
    this.modes[b] && (this.modes[b].tabDom.remove(), this.modes[b].contentDom.remove(), "hw" == b && ($(this.modes).removeClass(".propertyTabhw"), $(".propertyTabhw").unbind("dblclick")));
    this.modes[b] = {obj:a, tabDom:e, contentDom:c};
    "hw" == b && $(".propertyTabhw").bind("dblclick", function() {
      Entry.dispatchEvent("hwModeChange");
    });
  };
  a.removeMode = function(b) {
    this.modes[b] && (this.modes[b].tabDom.remove(), this.modes[b].contentDom.remove(), "hw" == b && ($(this.modes).removeClass(".propertyTabhw"), $(".propertyTabhw").unbind("dblclick")));
    (b = Object.keys(this.modes)) && 0 < b.length && this.select(b[0]);
  };
  a.resize = function(b) {
    this._view.css({width:b + "px", top:9 * b / 16 + 123 - 22 + "px"});
    430 <= b ? this._view.removeClass("collapsed") : this._view.addClass("collapsed");
    Entry.dispatchEvent("windowResized");
    b = this.selected;
    "hw" == b ? this.modes.hw.obj.listPorts ? this.modes[b].obj.resizeList() : this.modes[b].obj.resize() : this.modes[b].obj.resize();
  };
  a.select = function(b) {
    for (var a in this.modes) {
      var d = this.modes[a];
      d.tabDom.removeClass("selected");
      d.contentDom.addClass("entryRemove");
      d.obj.visible = !1;
    }
    a = this.modes[b];
    a.tabDom.addClass("selected");
    a.contentDom.removeClass("entryRemove");
    a.obj.resize && a.obj.resize();
    a.obj.visible = !0;
    this.selected = b;
  };
  a.initializeSplitter = function(b) {
    var a = this;
    b.bind("mousedown touchstart", function(b) {
      a._cover.removeClass("entryRemove");
      a._cover._isVisible = !0;
      Entry.container.disableSort();
      Entry.container.splitterEnable = !0;
      Entry.documentMousemove && (Entry.container.resizeEvent = Entry.documentMousemove.attach(this, function(b) {
        Entry.container.splitterEnable && Entry.resizeElement({canvasWidth:b.clientX || b.x});
      }));
    });
    $(document).bind("mouseup touchend", function(b) {
      if (b = Entry.container.resizeEvent) {
        Entry.container.splitterEnable = !1, Entry.documentMousemove.detach(b), delete Entry.container.resizeEvent;
      }
      a._cover._isVisible && (a._cover._isVisible = !1, a._cover.addClass("entryRemove"));
      Entry.container.enableSort();
    });
  };
})(Entry.PropertyPanel.prototype);
Entry.init = function(a, b) {
  Entry.assert("object" === typeof b, "Init option is not object");
  this.events_ = {};
  this.interfaceState = {menuWidth:264};
  Entry.Utils.bindGlobalEvent("resize mousedown mousemove keydown keyup dispose".split(" "));
  this.options = b;
  this.parseOptions(b);
  this.mediaFilePath = (b.libDir ? b.libDir : "/lib") + "/entryjs/images/";
  this.defaultPath = b.defaultDir || "";
  this.blockInjectPath = b.blockInjectDir || "";
  "workspace" == this.type && this.isPhone() && (this.type = "phone");
  this.initialize_();
  this.view_ = a;
  $(this.view_).addClass("entry");
  "tablet" === this.device && $(this.view_).addClass("tablet");
  Entry.initFonts(b.fonts);
  this.createDom(a, this.type);
  this.loadInterfaceState();
  this.overridePrototype();
  this.maxCloneLimit = 302;
  this.cloudSavable = !0;
  this.startTime = (new Date).getTime();
  document.onkeydown = function(b) {
    Entry.dispatchEvent("keyPressed", b);
  };
  document.onkeyup = function(b) {
    Entry.dispatchEvent("keyUpped", b);
  };
  window.onresize = function(b) {
    Entry.dispatchEvent("windowResized", b);
  };
  window.onbeforeunload = this.beforeUnload;
  Entry.addEventListener("saveWorkspace", function(b) {
    Entry.addActivity("save");
  });
  Entry.addEventListener("showBlockHelper", function(b) {
    Entry.propertyPanel.select("helper");
  });
  "IE" != Entry.getBrowserType().substr(0, 2) || window.flashaudio ? createjs.Sound.registerPlugins([createjs.WebAudioPlugin]) : (createjs.FlashAudioPlugin.swfPath = this.mediaFilePath + "media/", createjs.Sound.registerPlugins([createjs.FlashAudioPlugin]), window.flashaudio = !0);
  Entry.soundQueue = new createjs.LoadQueue;
  Entry.soundQueue.installPlugin(createjs.Sound);
  Entry.loadAudio_([Entry.mediaFilePath + "sounds/click.mp3", Entry.mediaFilePath + "sounds/click.wav", Entry.mediaFilePath + "sounds/click.ogg"], "entryMagneting");
  Entry.loadAudio_([Entry.mediaFilePath + "sounds/delete.mp3", Entry.mediaFilePath + "sounds/delete.ogg", Entry.mediaFilePath + "sounds/delete.wav"], "entryDelete");
  createjs.Sound.stop();
};
Entry.loadAudio_ = function(a, b) {
  if (window.Audio && a.length) {
    for (;0 < a.length;) {
      a = a[0];
      a.match(/\/([^.]+)./);
      Entry.soundQueue.loadFile({id:b, src:a, type:createjs.LoadQueue.SOUND});
      break;
    }
  }
};
Entry.initialize_ = function() {
  this.stage = new Entry.Stage;
  Entry.engine && Entry.engine.clearTimer();
  this.engine = new Entry.Engine;
  this.propertyPanel = new Entry.PropertyPanel;
  this.container = new Entry.Container;
  this.helper = new Entry.Helper;
  this.youtube = new Entry.Youtube;
  this.variableContainer = new Entry.VariableContainer;
  this.commander = new Entry.Commander(this.type);
  this.scene = new Entry.Scene;
  this.playground = new Entry.Playground;
  this.toast = new Entry.Toast;
  this.hw && this.hw.closeConnection();
  this.hw = new Entry.HW;
  if (Entry.enableActivityLogging) {
    this.reporter = new Entry.Reporter(!1);
  } else {
    if ("workspace" == this.type || "phone" == this.type) {
      this.reporter = new Entry.Reporter(!0);
    }
  }
};
Entry.createDom = function(a, b) {
  if (b && "workspace" != b) {
    "minimize" == b ? (c = Entry.createElement("canvas"), c.className = "entryCanvasWorkspace", c.id = "entryCanvas", c.width = 640, c.height = 360, d = Entry.createElement("div", "entryCanvasWrapper"), d.appendChild(c), a.appendChild(d), this.canvas_ = c, this.stage.initStage(this.canvas_), d = Entry.createElement("div"), a.appendChild(d), this.engineView = d, this.engine.generateView(this.engineView, b)) : "phone" == b && (this.stateManagerView = c = Entry.createElement("div"), this.stateManager.generateView(this.stateManagerView, 
    b), d = Entry.createElement("div"), a.appendChild(d), this.engineView = d, this.engine.generateView(this.engineView, b), c = Entry.createElement("canvas"), c.addClass("entryCanvasPhone"), c.id = "entryCanvas", c.width = 640, c.height = 360, d.insertBefore(c, this.engine.footerView_), this.canvas_ = c, this.stage.initStage(this.canvas_), c = Entry.createElement("div"), a.appendChild(c), this.containerView = c, this.container.generateView(this.containerView, b), c = Entry.createElement("div"), 
    a.appendChild(c), this.playgroundView = c, this.playground.generateView(this.playgroundView, b));
  } else {
    Entry.documentMousedown.attach(this, this.cancelObjectEdit);
    var c = Entry.createElement("div");
    a.appendChild(c);
    this.sceneView = c;
    this.scene.generateView(this.sceneView, b);
    c = Entry.createElement("div");
    this.sceneView.appendChild(c);
    this.stateManagerView = c;
    this.stateManager.generateView(this.stateManagerView, b);
    var d = Entry.createElement("div");
    a.appendChild(d);
    this.engineView = d;
    this.engine.generateView(this.engineView, b);
    c = Entry.createElement("canvas");
    c.addClass("entryCanvasWorkspace");
    c.id = "entryCanvas";
    c.width = 640;
    c.height = 360;
    d.insertBefore(c, this.engine.addButton);
    c.addEventListener("mousewheel", function(b) {
      var a = Entry.variableContainer.getListById(Entry.stage.mouseCoordinate);
      b = 0 < b.wheelDelta ? !0 : !1;
      for (var c = 0;c < a.length;c++) {
        var d = a[c];
        d.scrollButton_.y = b ? 46 <= d.scrollButton_.y ? d.scrollButton_.y - 23 : 23 : d.scrollButton_.y + 23;
        d.updateView();
      }
    });
    this.canvas_ = c;
    this.stage.initStage(this.canvas_);
    c = Entry.createElement("div");
    this.propertyPanel.generateView(a, b);
    this.containerView = c;
    this.container.generateView(this.containerView, b);
    this.propertyPanel.addMode("object", this.container);
    this.helper.generateView(this.containerView, b);
    this.propertyPanel.addMode("helper", this.helper);
    c = Entry.createElement("div");
    a.appendChild(c);
    this.playgroundView = c;
    this.playground.generateView(this.playgroundView, b);
    this.propertyPanel.select("object");
    this.helper.bindWorkspace(this.playground.mainWorkspace);
  }
};
Entry.start = function(a) {
  "invisible" !== Entry.type && (this.FPS || (this.FPS = 60), Entry.assert("number" == typeof this.FPS, "FPS must be number"), Entry.engine.start(this.FPS));
};
Entry.stop = function() {
  "invisible" !== Entry.type && (this.FPS = null, Entry.engine.stop());
};
Entry.parseOptions = function(a) {
  this.type = a.type;
  a.device && (this.device = a.device);
  this.projectSaveable = a.projectsaveable;
  void 0 === this.projectSaveable && (this.projectSaveable = !0);
  this.objectAddable = a.objectaddable;
  void 0 === this.objectAddable && (this.objectAddable = !0);
  this.objectEditable = a.objectEditable;
  void 0 === this.objectEditable && (this.objectEditable = !0);
  this.objectEditable || (this.objectAddable = !1);
  this.objectDeletable = a.objectdeletable;
  void 0 === this.objectDeletable && (this.objectDeletable = !0);
  this.soundEditable = a.soundeditable;
  void 0 === this.soundEditable && (this.soundEditable = !0);
  this.pictureEditable = a.pictureeditable;
  void 0 === this.pictureEditable && (this.pictureEditable = !0);
  this.sceneEditable = a.sceneEditable;
  void 0 === this.sceneEditable && (this.sceneEditable = !0);
  this.functionEnable = a.functionEnable;
  void 0 === this.functionEnable && (this.functionEnable = !0);
  this.messageEnable = a.messageEnable;
  void 0 === this.messageEnable && (this.messageEnable = !0);
  this.variableEnable = a.variableEnable;
  void 0 === this.variableEnable && (this.variableEnable = !0);
  this.listEnable = a.listEnable;
  void 0 === this.listEnable && (this.listEnable = !0);
  this.hasVariableManager = a.hasvariablemanager;
  this.variableEnable || this.messageEnable || this.listEnable || this.functionEnable ? void 0 === this.hasVariableManager && (this.hasVariableManager = !0) : this.hasVariableManager = !1;
  this.isForLecture = a.isForLecture;
};
Entry.initFonts = function(a) {
  this.fonts = a;
  a || (this.fonts = []);
};
Entry.Activity = function(a, b) {
  this.name = a;
  this.timestamp = new Date;
  a = [];
  if (void 0 !== b) {
    for (var c = 0, d = b.length;c < d;c++) {
      var e = b[c];
      a.push({key:e[0], value:e[1]});
    }
  }
  this.data = a;
};
Entry.ActivityReporter = function() {
  this._activities = [];
};
(function(a) {
  a.add = function(b) {
    if (b && 0 !== b.length) {
      if (!(b instanceof Entry.Activity)) {
        var a = b.shift();
        b = new Entry.Activity(a, b);
      }
      this._activities.push(b);
    }
  };
  a.clear = function() {
    this._activities = [];
  };
  a.get = function() {
    return this._activities;
  };
  a.report = function() {
  };
})(Entry.ActivityReporter.prototype);
Entry.State = function(a, b, c, d) {
  this.caller = b;
  this.func = c;
  3 < arguments.length && (this.params = Array.prototype.slice.call(arguments).slice(3));
  this.message = a;
  this.time = Entry.getUpTime();
  this.isPass = Entry.Command[a] ? Entry.Command[a].isPass : !1;
};
Entry.State.prototype.generateMessage = function() {
};
Entry.StateManager = function() {
  this.undoStack_ = [];
  this.redoStack_ = [];
  this.isIgnore = this.isRestore = !1;
  Entry.addEventListener("cancelLastCommand", function(a) {
    Entry.stateManager.cancelLastCommand();
  });
  Entry.addEventListener("run", function(a) {
    Entry.stateManager.updateView();
  });
  Entry.addEventListener("stop", function(a) {
    Entry.stateManager.updateView();
  });
  Entry.addEventListener("saveWorkspace", function(a) {
    Entry.stateManager.addStamp();
  });
  Entry.addEventListener("undo", function(a) {
    Entry.stateManager.undo();
  });
  Entry.addEventListener("redo", function(a) {
    Entry.stateManager.redo();
  });
};
Entry.StateManager.prototype.generateView = function(a, b) {
};
Entry.StateManager.prototype.addCommand = function(a, b, c, d) {
  if (!this.isIgnoring()) {
    if (this.isRestoring()) {
      var e = new Entry.State, f = Array.prototype.slice.call(arguments);
      Entry.State.prototype.constructor.apply(e, f);
      this.redoStack_.push(e);
      Entry.reporter && Entry.reporter.report(e);
    } else {
      e = new Entry.State, f = Array.prototype.slice.call(arguments), Entry.State.prototype.constructor.apply(e, f), this.undoStack_.push(e), Entry.reporter && Entry.reporter.report(e), this.updateView();
    }
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.cancelLastCommand = function() {
  this.canUndo() && (this.undoStack_.pop(), this.updateView(), Entry.creationChangedEvent && Entry.creationChangedEvent.notify());
};
Entry.StateManager.prototype.getLastCommand = function() {
  return this.undoStack_[this.undoStack_.length - 1];
};
Entry.StateManager.prototype.undo = function() {
  if (this.canUndo() && !this.isRestoring()) {
    this.addActivity("undo");
    for (this.startRestore();this.undoStack_.length;) {
      var a = this.undoStack_.pop();
      a.func.apply(a.caller, a.params);
      if (!0 !== a.isPass) {
        break;
      }
    }
    this.updateView();
    this.endRestore();
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.redo = function() {
  if (this.canRedo() && !this.isRestoring()) {
    for (this.addActivity("redo");this.redoStack_.length;) {
      var a = this.redoStack_.pop();
      a.func.apply(a.caller, a.params);
      if (!0 !== a.isPass) {
        break;
      }
    }
    this.updateView();
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.updateView = function() {
  this.undoButton && this.redoButton && (this.canUndo() ? this.undoButton.addClass("active") : this.undoButton.removeClass("active"), this.canRedo() ? this.redoButton.addClass("active") : this.redoButton.removeClass("active"));
};
Entry.StateManager.prototype.startRestore = function() {
  this.isRestore = !0;
};
Entry.StateManager.prototype.endRestore = function() {
  this.isRestore = !1;
};
Entry.StateManager.prototype.isRestoring = function() {
  return this.isRestore;
};
Entry.StateManager.prototype.startIgnore = function() {
  this.isIgnore = !0;
};
Entry.StateManager.prototype.endIgnore = function() {
  this.isIgnore = !1;
};
Entry.StateManager.prototype.isIgnoring = function() {
  return this.isIgnore;
};
Entry.StateManager.prototype.canUndo = function() {
  return 0 < this.undoStack_.length && Entry.engine.isState("stop");
};
Entry.StateManager.prototype.canRedo = function() {
  return 0 < this.redoStack_.length && Entry.engine.isState("stop");
};
Entry.StateManager.prototype.addStamp = function() {
  this.stamp = Entry.generateHash();
  this.undoStack_.length && (this.undoStack_[this.undoStack_.length - 1].stamp = this.stamp);
};
Entry.StateManager.prototype.isSaved = function() {
  return 0 === this.undoStack_.length || this.undoStack_[this.undoStack_.length - 1].stamp == this.stamp && "string" == typeof this.stamp;
};
Entry.StateManager.prototype.addActivity = function(a) {
  Entry.reporter && Entry.reporter.report(new Entry.State(a));
};
Entry.BlockModel = function() {
  Entry.Model(this);
};
Entry.BlockModel.prototype.schema = {id:null, x:0, y:0, type:null, params:{}, statements:{}, prev:null, next:null, view:null};
Entry.BlockRenderModel = function() {
  Entry.Model(this);
};
Entry.BlockRenderModel.prototype.schema = {id:0, type:Entry.STATIC.BLOCK_RENDER_MODEL, x:0, y:0, width:0, height:0, magneting:!1};
Entry.BoxModel = function() {
  Entry.Model(this);
};
Entry.BoxModel.prototype.schema = {id:0, type:Entry.STATIC.BOX_MODEL, x:0, y:0, width:0, height:0};
Entry.DragInstance = function(a) {
  Entry.Model(this);
  this.set(a);
};
Entry.DragInstance.prototype.schema = {type:Entry.STATIC.DRAG_INSTANCE, startX:0, startY:0, offsetX:0, offsetY:0, absX:0, absY:0, prev:null, height:0, mode:0, isNew:!1};
Entry.ThreadModel = function() {
  Entry.Model(this);
};
Entry.ThreadModel.prototype.schema = {id:0, type:Entry.STATIC.THREAD_MODEL, x:0, y:0, width:0, minWidth:0, height:0};
Entry.EntryObject = function(a) {
  var b = this;
  if (a) {
    this.id = a.id;
    this.name = a.name || a.sprite.name;
    this.text = a.text || this.name;
    this.objectType = a.objectType;
    this.objectType || (this.objectType = "sprite");
    this.script = new Entry.Code(a.script ? a.script : [], this);
    this.pictures = a.sprite.pictures;
    this.sounds = [];
    this.sounds = a.sprite.sounds;
    for (var c = 0;c < this.sounds.length;c++) {
      this.sounds[c].id || (this.sounds[c].id = Entry.generateHash()), Entry.initSound(this.sounds[c]);
    }
    this.lock = a.lock ? a.lock : !1;
    this.isEditing = !1;
    "sprite" == this.objectType && (this.selectedPicture = a.selectedPictureId ? this.getPicture(a.selectedPictureId) : this.pictures[0]);
    this.scene = Entry.scene.getSceneById(a.scene) || Entry.scene.selectedScene;
    this.setRotateMethod(a.rotateMethod);
    this.entity = new Entry.EntityObject(this);
    this.entity.injectModel(this.selectedPicture ? this.selectedPicture : null, a.entity ? a.entity : this.initEntity(a));
    this.clonedEntities = [];
    Entry.stage.loadObject(this);
    for (c in this.pictures) {
      (function(a) {
        a.objectId = this.id;
        a.id || (a.id = Entry.generateHash());
        var c = new Image;
        if (a.fileurl) {
          c.src = a.fileurl;
        } else {
          if (a.fileurl) {
            c.src = a.fileurl;
          } else {
            var d = a.filename;
            c.src = Entry.defaultPath + "/uploads/" + d.substring(0, 2) + "/" + d.substring(2, 4) + "/image/" + d + ".png";
          }
        }
        Entry.Loader.addQueue();
        c.onload = function(c) {
          Entry.container.cachePicture(a.id + b.entity.id, this);
          Entry.requestUpdate = !0;
          Entry.Loader.removeQueue();
        };
        c.onerror = function(b) {
          Entry.Loader.removeQueue();
        };
      })(this.pictures[c]);
    }
  }
};
Entry.EntryObject.prototype.generateView = function() {
  if ("workspace" == Entry.type) {
    var a = Entry.createElement("li", this.id);
    a.addClass("entryContainerListElementWorkspace");
    a.object = this;
    Entry.Utils.disableContextmenu(a);
    var b = this;
    longPressTimer = null;
    $(a).bind("mousedown touchstart", function(a) {
      function c(b) {
        b.stopPropagation();
        h && 5 < Math.sqrt(Math.pow(b.pageX - h.x, 2) + Math.pow(b.pageY - h.y, 2)) && longPressTimer && (clearTimeout(longPressTimer), longPressTimer = null);
      }
      function d(b) {
        b.stopPropagation();
        e.unbind(".object");
        longPressTimer && (clearTimeout(longPressTimer), longPressTimer = null);
      }
      Entry.container.getObject(this.id) && Entry.container.selectObject(this.id);
      var e = $(document), f = a.type, g = !1;
      if (Entry.Utils.isRightButton(a)) {
        a.stopPropagation(), Entry.documentMousedown.notify(a), g = !0, b._rightClick(a);
      } else {
        var h = {x:a.clientX, y:a.clientY};
        "touchstart" !== f || g || (a.stopPropagation(), Entry.documentMousedown.notify(a), longPressTimer = setTimeout(function() {
          longPressTimer && (longPressTimer = null, b._rightClick(a));
        }, 1E3), e.bind("mousemove.object touchmove.object", c), e.bind("mouseup.object touchend.object", d));
      }
    });
    this.view_ = a;
    var c = this, a = Entry.createElement("ul");
    a.addClass("objectInfoView");
    Entry.objectEditable || a.addClass("entryHide");
    var d = Entry.createElement("li");
    d.addClass("objectInfo_visible");
    this.entity.getVisible() || d.addClass("objectInfo_unvisible");
    d.bindOnClick(function(b) {
      Entry.engine.isState("run") || (b = c.entity, b.setVisible(!b.getVisible()) ? this.removeClass("objectInfo_unvisible") : this.addClass("objectInfo_unvisible"));
    });
    var e = Entry.createElement("li");
    e.addClass("objectInfo_unlock");
    this.getLock() && e.addClass("objectInfo_lock");
    e.bindOnClick(function(b) {
      Entry.engine.isState("run") || (b = c, b.setLock(!b.getLock()) ? this.addClass("objectInfo_lock") : this.removeClass("objectInfo_lock"), b.updateInputViews(b.getLock()));
    });
    a.appendChild(d);
    a.appendChild(e);
    this.view_.appendChild(a);
    a = Entry.createElement("div");
    a.addClass("entryObjectThumbnailWorkspace");
    this.view_.appendChild(a);
    this.thumbnailView_ = a;
    a = Entry.createElement("div");
    a.addClass("entryObjectWrapperWorkspace");
    this.view_.appendChild(a);
    d = Entry.createElement("input");
    d.bindOnClick(function(b) {
      b.preventDefault();
      Entry.container.selectObject(c.id);
      this.readOnly || (this.focus(), this.select());
    });
    d.addClass("entryObjectNameWorkspace");
    a.appendChild(d);
    this.nameView_ = d;
    this.nameView_.entryObject = this;
    d.setAttribute("readonly", !0);
    var f = this;
    this.nameView_.onblur = function(b) {
      this.entryObject.name = this.value;
      Entry.playground.reloadPlayground();
    };
    this.nameView_.onkeypress = function(b) {
      13 == b.keyCode && f.editObjectValues(!1);
    };
    this.nameView_.value = this.name;
    d = Entry.createElement("div");
    d.addClass("entryObjectEditWorkspace");
    d.object = this;
    this.editView_ = d;
    this.view_.appendChild(d);
    $(d).mousedown(function(a) {
      var c = b.isEditing;
      a.stopPropagation();
      Entry.documentMousedown.notify(a);
      Entry.engine.isState("run") || !1 !== c || (b.editObjectValues(!c), Entry.playground.object !== b && Entry.container.selectObject(b.id), b.nameView_.select());
    });
    d.blur = function(a) {
      b.editObjectComplete();
    };
    Entry.objectEditable && Entry.objectDeletable && (d = Entry.createElement("div"), d.addClass("entryObjectDeleteWorkspace"), d.object = this, this.deleteView_ = d, this.view_.appendChild(d), d.bindOnClick(function(b) {
      Entry.engine.isState("run") || Entry.container.removeObject(this.object);
    }));
    d = Entry.createElement("div");
    d.addClass("entryObjectInformationWorkspace");
    d.object = this;
    this.isInformationToggle = !1;
    a.appendChild(d);
    this.informationView_ = d;
    a = Entry.createElement("div");
    a.addClass("entryObjectRotationWrapperWorkspace");
    a.object = this;
    this.view_.appendChild(a);
    d = Entry.createElement("span");
    d.addClass("entryObjectCoordinateWorkspace");
    a.appendChild(d);
    e = Entry.createElement("span");
    e.addClass("entryObjectCoordinateSpanWorkspace");
    e.innerHTML = "X:";
    var g = Entry.createElement("input");
    g.addClass("entryObjectCoordinateInputWorkspace");
    g.setAttribute("readonly", !0);
    g.bindOnClick(function(b) {
      b.stopPropagation();
      this.select();
    });
    var h = Entry.createElement("span");
    h.addClass("entryObjectCoordinateSpanWorkspace");
    h.innerHTML = "Y:";
    var k = Entry.createElement("input");
    k.addClass("entryObjectCoordinateInputWorkspace entryObjectCoordinateInputWorkspace_right");
    k.bindOnClick(function(b) {
      b.stopPropagation();
      this.select();
    });
    k.setAttribute("readonly", !0);
    var m = Entry.createElement("span");
    m.addClass("entryObjectCoordinateSizeWorkspace");
    m.innerHTML = Lang.Workspace.Size + " : ";
    var l = Entry.createElement("input");
    l.addClass("entryObjectCoordinateInputWorkspace", "entryObjectCoordinateInputWorkspace_size");
    l.bindOnClick(function(b) {
      b.stopPropagation();
      this.select();
    });
    l.setAttribute("readonly", !0);
    d.appendChild(e);
    d.appendChild(g);
    d.appendChild(h);
    d.appendChild(k);
    d.appendChild(m);
    d.appendChild(l);
    d.xInput_ = g;
    d.yInput_ = k;
    d.sizeInput_ = l;
    this.coordinateView_ = d;
    c = this;
    g.onkeypress = function(b) {
      13 == b.keyCode && c.editObjectValues(!1);
    };
    g.onblur = function(b) {
      isNaN(g.value) || c.entity.setX(Number(g.value));
      c.updateCoordinateView();
      Entry.stage.updateObject();
    };
    k.onkeypress = function(b) {
      13 == b.keyCode && c.editObjectValues(!1);
    };
    k.onblur = function(b) {
      isNaN(k.value) || c.entity.setY(Number(k.value));
      c.updateCoordinateView();
      Entry.stage.updateObject();
    };
    l.onkeypress = function(b) {
      13 == b.keyCode && c.editObjectValues(!1);
    };
    l.onblur = function(b) {
      isNaN(l.value) || c.entity.setSize(Number(l.value));
      c.updateCoordinateView();
      Entry.stage.updateObject();
    };
    d = Entry.createElement("div");
    d.addClass("entryObjectRotateLabelWrapperWorkspace");
    this.view_.appendChild(d);
    this.rotateLabelWrapperView_ = d;
    e = Entry.createElement("span");
    e.addClass("entryObjectRotateSpanWorkspace");
    e.innerHTML = Lang.Workspace.rotation + " : ";
    var n = Entry.createElement("input");
    n.addClass("entryObjectRotateInputWorkspace");
    n.setAttribute("readonly", !0);
    n.bindOnClick(function(b) {
      b.stopPropagation();
      this.select();
    });
    this.rotateSpan_ = e;
    this.rotateInput_ = n;
    h = Entry.createElement("span");
    h.addClass("entryObjectDirectionSpanWorkspace");
    h.innerHTML = Lang.Workspace.direction + " : ";
    var q = Entry.createElement("input");
    q.addClass("entryObjectDirectionInputWorkspace");
    q.setAttribute("readonly", !0);
    q.bindOnClick(function(b) {
      b.stopPropagation();
      this.select();
    });
    this.directionInput_ = q;
    d.appendChild(e);
    d.appendChild(n);
    d.appendChild(h);
    d.appendChild(q);
    d.rotateInput_ = n;
    d.directionInput_ = q;
    c = this;
    n.onkeypress = function(b) {
      13 == b.keyCode && c.editObjectValues(!1);
    };
    n.onblur = function(b) {
      b = n.value;
      -1 != b.indexOf("\u02da") && (b = b.substring(0, b.indexOf("\u02da")));
      isNaN(b) || c.entity.setRotation(Number(b));
      c.updateRotationView();
      Entry.stage.updateObject();
    };
    q.onkeypress = function(b) {
      13 == b.keyCode && c.editObjectValues(!1);
    };
    q.onblur = function(b) {
      b = q.value;
      -1 != b.indexOf("\u02da") && (b = b.substring(0, b.indexOf("\u02da")));
      isNaN(b) || c.entity.setDirection(Number(b));
      c.updateRotationView();
      Entry.stage.updateObject();
    };
    d = Entry.createElement("div");
    d.addClass("rotationMethodWrapper");
    a.appendChild(d);
    this.rotationMethodWrapper_ = d;
    a = Entry.createElement("span");
    a.addClass("entryObjectRotateMethodLabelWorkspace");
    d.appendChild(a);
    a.innerHTML = Lang.Workspace.rotate_method + " : ";
    a = Entry.createElement("div");
    a.addClass("entryObjectRotateModeWorkspace");
    a.addClass("entryObjectRotateModeAWorkspace");
    a.object = this;
    this.rotateModeAView_ = a;
    d.appendChild(a);
    a.bindOnClick(function(b) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("free"), this.object.setRotateMethod("free"));
    });
    a = Entry.createElement("div");
    a.addClass("entryObjectRotateModeWorkspace");
    a.addClass("entryObjectRotateModeBWorkspace");
    a.object = this;
    this.rotateModeBView_ = a;
    d.appendChild(a);
    a.bindOnClick(function(b) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("vertical"), this.object.setRotateMethod("vertical"));
    });
    a = Entry.createElement("div");
    a.addClass("entryObjectRotateModeWorkspace");
    a.addClass("entryObjectRotateModeCWorkspace");
    a.object = this;
    this.rotateModeCView_ = a;
    d.appendChild(a);
    a.bindOnClick(function(b) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("none"), this.object.setRotateMethod("none"));
    });
    this.updateThumbnailView();
    this.updateCoordinateView();
    this.updateRotateMethodView();
    this.updateInputViews();
    this.updateCoordinateView(!0);
    this.updateRotationView(!0);
    return this.view_;
  }
  if ("phone" == Entry.type) {
    return a = Entry.createElement("li", this.id), a.addClass("entryContainerListElementWorkspace"), a.object = this, a.bindOnClick(function(b) {
      Entry.container.getObject(this.id) && Entry.container.selectObject(this.id);
    }), $ && (b = this, context.attach("#" + this.id, [{text:Lang.Workspace.context_rename, href:"/", action:function(b) {
      b.preventDefault();
    }}, {text:Lang.Workspace.context_duplicate, href:"/", action:function(a) {
      a.preventDefault();
      Entry.container.addCloneObject(b);
    }}, {text:Lang.Workspace.context_remove, href:"/", action:function(a) {
      a.preventDefault();
      Entry.container.removeObject(b);
    }}])), this.view_ = a, a = Entry.createElement("ul"), a.addClass("objectInfoView"), d = Entry.createElement("li"), d.addClass("objectInfo_visible"), e = Entry.createElement("li"), e.addClass("objectInfo_lock"), a.appendChild(d), a.appendChild(e), this.view_.appendChild(a), a = Entry.createElement("div"), a.addClass("entryObjectThumbnailWorkspace"), this.view_.appendChild(a), this.thumbnailView_ = a, a = Entry.createElement("div"), a.addClass("entryObjectWrapperWorkspace"), this.view_.appendChild(a), 
    d = Entry.createElement("input"), d.addClass("entryObjectNameWorkspace"), a.appendChild(d), this.nameView_ = d, this.nameView_.entryObject = this, this.nameView_.onblur = function() {
      this.entryObject.name = this.value;
      Entry.playground.reloadPlayground();
    }, this.nameView_.onkeypress = function(b) {
      13 == b.keyCode && c.editObjectValues(!1);
    }, this.nameView_.value = this.name, Entry.objectEditable && Entry.objectDeletable && (d = Entry.createElement("div"), d.addClass("entryObjectDeletePhone"), d.object = this, this.deleteView_ = d, this.view_.appendChild(d), d.bindOnClick(function(b) {
      Entry.engine.isState("run") || Entry.container.removeObject(this.object);
    })), d = Entry.createElement("button"), d.addClass("entryObjectEditPhone"), d.object = this, d.bindOnClick(function(b) {
      if (b = Entry.container.getObject(this.id)) {
        Entry.container.selectObject(b.id), Entry.playground.injectObject(b);
      }
    }), this.view_.appendChild(d), d = Entry.createElement("div"), d.addClass("entryObjectInformationWorkspace"), d.object = this, this.isInformationToggle = !1, a.appendChild(d), this.informationView_ = d, d = Entry.createElement("div"), d.addClass("entryObjectRotateLabelWrapperWorkspace"), this.view_.appendChild(d), this.rotateLabelWrapperView_ = d, e = Entry.createElement("span"), e.addClass("entryObjectRotateSpanWorkspace"), e.innerHTML = Lang.Workspace.rotation + " : ", n = Entry.createElement("input"), 
    n.addClass("entryObjectRotateInputWorkspace"), this.rotateSpan_ = e, this.rotateInput_ = n, h = Entry.createElement("span"), h.addClass("entryObjectDirectionSpanWorkspace"), h.innerHTML = Lang.Workspace.direction + " : ", q = Entry.createElement("input"), q.addClass("entryObjectDirectionInputWorkspace"), this.directionInput_ = q, d.appendChild(e), d.appendChild(n), d.appendChild(h), d.appendChild(q), d.rotateInput_ = n, d.directionInput_ = q, c = this, n.onkeypress = function(b) {
      13 == b.keyCode && (b = n.value, -1 != b.indexOf("\u02da") && (b = b.substring(0, b.indexOf("\u02da"))), isNaN(b) || c.entity.setRotation(Number(b)), c.updateRotationView(), n.blur());
    }, n.onblur = function(b) {
      c.entity.setRotation(c.entity.getRotation());
      Entry.stage.updateObject();
    }, q.onkeypress = function(b) {
      13 == b.keyCode && (b = q.value, -1 != b.indexOf("\u02da") && (b = b.substring(0, b.indexOf("\u02da"))), isNaN(b) || c.entity.setDirection(Number(b)), c.updateRotationView(), q.blur());
    }, q.onblur = function(b) {
      c.entity.setDirection(c.entity.getDirection());
      Entry.stage.updateObject();
    }, a = Entry.createElement("div"), a.addClass("entryObjectRotationWrapperWorkspace"), a.object = this, this.view_.appendChild(a), d = Entry.createElement("span"), d.addClass("entryObjectCoordinateWorkspace"), a.appendChild(d), e = Entry.createElement("span"), e.addClass("entryObjectCoordinateSpanWorkspace"), e.innerHTML = "X:", g = Entry.createElement("input"), g.addClass("entryObjectCoordinateInputWorkspace"), h = Entry.createElement("span"), h.addClass("entryObjectCoordinateSpanWorkspace"), 
    h.innerHTML = "Y:", k = Entry.createElement("input"), k.addClass("entryObjectCoordinateInputWorkspace entryObjectCoordinateInputWorkspace_right"), m = Entry.createElement("span"), m.addClass("entryObjectCoordinateSpanWorkspace"), m.innerHTML = Lang.Workspace.Size, l = Entry.createElement("input"), l.addClass("entryObjectCoordinateInputWorkspace", "entryObjectCoordinateInputWorkspace_size"), d.appendChild(e), d.appendChild(g), d.appendChild(h), d.appendChild(k), d.appendChild(m), d.appendChild(l), 
    d.xInput_ = g, d.yInput_ = k, d.sizeInput_ = l, this.coordinateView_ = d, c = this, g.onkeypress = function(b) {
      13 == b.keyCode && (isNaN(g.value) || c.entity.setX(Number(g.value)), c.updateCoordinateView(), c.blur());
    }, g.onblur = function(b) {
      c.entity.setX(c.entity.getX());
      Entry.stage.updateObject();
    }, k.onkeypress = function(b) {
      13 == b.keyCode && (isNaN(k.value) || c.entity.setY(Number(k.value)), c.updateCoordinateView(), c.blur());
    }, k.onblur = function(b) {
      c.entity.setY(c.entity.getY());
      Entry.stage.updateObject();
    }, d = Entry.createElement("div"), d.addClass("rotationMethodWrapper"), a.appendChild(d), this.rotationMethodWrapper_ = d, a = Entry.createElement("span"), a.addClass("entryObjectRotateMethodLabelWorkspace"), d.appendChild(a), a.innerHTML = Lang.Workspace.rotate_method + " : ", a = Entry.createElement("div"), a.addClass("entryObjectRotateModeWorkspace"), a.addClass("entryObjectRotateModeAWorkspace"), a.object = this, this.rotateModeAView_ = a, d.appendChild(a), a.bindOnClick(function(b) {
      Entry.engine.isState("run") || this.object.setRotateMethod("free");
    }), a = Entry.createElement("div"), a.addClass("entryObjectRotateModeWorkspace"), a.addClass("entryObjectRotateModeBWorkspace"), a.object = this, this.rotateModeBView_ = a, d.appendChild(a), a.bindOnClick(function(b) {
      Entry.engine.isState("run") || this.object.setRotateMethod("vertical");
    }), a = Entry.createElement("div"), a.addClass("entryObjectRotateModeWorkspace"), a.addClass("entryObjectRotateModeCWorkspace"), a.object = this, this.rotateModeCView_ = a, d.appendChild(a), a.bindOnClick(function(b) {
      Entry.engine.isState("run") || this.object.setRotateMethod("none");
    }), this.updateThumbnailView(), this.updateCoordinateView(), this.updateRotateMethodView(), this.updateInputViews(), this.view_;
  }
};
Entry.EntryObject.prototype.setName = function(a) {
  Entry.assert("string" == typeof a, "object name must be string");
  this.name = a;
  this.nameView_.value = a;
};
Entry.EntryObject.prototype.setText = function(a) {
  Entry.assert("string" == typeof a, "object text must be string");
  this.text = a;
};
Entry.EntryObject.prototype.setScript = function(a) {
  this.script = a;
};
Entry.EntryObject.prototype.getScriptText = function() {
  return JSON.stringify(this.script.toJSON());
};
Entry.EntryObject.prototype.initEntity = function(a) {
  var b = {};
  b.x = b.y = 0;
  b.rotation = 0;
  b.direction = 90;
  if ("sprite" == this.objectType) {
    var c = a.sprite.pictures[0].dimension;
    b.regX = c.width / 2;
    b.regY = c.height / 2;
    b.scaleX = b.scaleY = "background" == a.sprite.category.main || "new" == a.sprite.category.main ? Math.max(270 / c.height, 480 / c.width) : "new" == a.sprite.category.main ? 1 : 200 / (c.width + c.height);
    b.width = c.width;
    b.height = c.height;
  } else {
    if ("textBox" == this.objectType) {
      if (b.regX = 25, b.regY = 12, b.scaleX = b.scaleY = 1.5, b.width = 50, b.height = 24, b.text = a.text, a.options) {
        if (a = a.options, c = "", a.bold && (c += "bold "), a.italic && (c += "italic "), b.underline = a.underline, b.strike = a.strike, b.font = c + "20px " + a.font.family, b.colour = a.colour, b.bgColor = a.background, b.lineBreak = a.lineBreak) {
          b.width = 256, b.height = .5625 * b.width, b.regX = b.width / 2, b.regY = b.height / 2;
        }
      } else {
        b.underline = !1, b.strike = !1, b.font = "20px Nanum Gothic", b.colour = "#000000", b.bgColor = "#ffffff";
      }
    }
  }
  return b;
};
Entry.EntryObject.prototype.updateThumbnailView = function() {
  if ("sprite" == this.objectType) {
    if (this.entity.picture.fileurl) {
      this.thumbnailView_.style.backgroundImage = 'url("' + this.entity.picture.fileurl + '")';
    } else {
      var a = this.entity.picture.filename;
      this.thumbnailView_.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + a.substring(0, 2) + "/" + a.substring(2, 4) + "/thumb/" + a + '.png")';
    }
  } else {
    "textBox" == this.objectType && (this.thumbnailView_.style.backgroundImage = "url(" + (Entry.mediaFilePath + "/text_icon.png") + ")");
  }
};
Entry.EntryObject.prototype.updateCoordinateView = function(a) {
  if ((this.isSelected() || a) && this.coordinateView_ && this.coordinateView_.xInput_ && this.coordinateView_.yInput_) {
    a = this.coordinateView_.xInput_.value;
    var b = this.coordinateView_.yInput_.value, c = this.coordinateView_.sizeInput_.value, d = this.entity.getX().toFixed(1), e = this.entity.getY().toFixed(1), f = this.entity.getSize().toFixed(1);
    a != d && (this.coordinateView_.xInput_.value = d);
    b != e && (this.coordinateView_.yInput_.value = e);
    c != f && (this.coordinateView_.sizeInput_.value = f);
  }
};
Entry.EntryObject.prototype.updateRotationView = function(a) {
  if (this.isSelected() && this.view_ || a) {
    a = "", "free" == this.getRotateMethod() ? (this.rotateSpan_.removeClass("entryRemove"), this.rotateInput_.removeClass("entryRemove"), a += this.entity.getRotation().toFixed(1), this.rotateInput_.value = a + "\u02da") : (this.rotateSpan_.addClass("entryRemove"), this.rotateInput_.addClass("entryRemove")), a = "" + this.entity.getDirection().toFixed(1), this.directionInput_.value = a + "\u02da";
  }
};
Entry.EntryObject.prototype.select = function(a) {
  console.log(this);
};
Entry.EntryObject.prototype.addPicture = function(a, b) {
  Entry.stateManager && Entry.stateManager.addCommand("add sprite", this, this.removePicture, a.id);
  a.objectId = this.id;
  b || 0 === b ? (this.pictures.splice(b, 0, a), Entry.playground.injectPicture(this)) : this.pictures.push(a);
  return new Entry.State(this, this.removePicture, a.id);
};
Entry.EntryObject.prototype.removePicture = function(a) {
  if (2 > this.pictures.length) {
    return !1;
  }
  a = this.getPicture(a);
  var b = this.pictures.indexOf(a);
  Entry.stateManager && Entry.stateManager.addCommand("remove sprite", this, this.addPicture, a, b);
  this.pictures.splice(b, 1);
  a === this.selectedPicture && Entry.playground.selectPicture(this.pictures[0]);
  Entry.playground.injectPicture(this);
  Entry.playground.reloadPlayground();
  return new Entry.State(this, this.addPicture, a, b);
};
Entry.EntryObject.prototype.getPicture = function(a) {
  if (!a) {
    return this.selectedPicture;
  }
  a = a.trim();
  for (var b = this.pictures, c = b.length, d = 0;d < c;d++) {
    if (b[d].id == a) {
      return b[d];
    }
  }
  for (d = 0;d < c;d++) {
    if (b[d].name == a) {
      return b[d];
    }
  }
  a = Entry.parseNumber(a);
  if ((!1 !== a || "boolean" != typeof a) && c >= a && 0 < a) {
    return b[a - 1];
  }
  throw Error("No picture found");
};
Entry.EntryObject.prototype.setPicture = function(a) {
  for (var b in this.pictures) {
    if (a.id === this.pictures[b].id) {
      this.pictures[b] = a;
      return;
    }
  }
  throw Error("No picture found");
};
Entry.EntryObject.prototype.getPrevPicture = function(a) {
  for (var b = this.pictures, c = b.length, d = 0;d < c;d++) {
    if (b[d].id == a) {
      return b[0 == d ? c - 1 : d - 1];
    }
  }
};
Entry.EntryObject.prototype.getNextPicture = function(a) {
  for (var b = this.pictures, c = b.length, d = 0;d < c;d++) {
    if (b[d].id == a) {
      return b[d == c - 1 ? 0 : d + 1];
    }
  }
};
Entry.EntryObject.prototype.selectPicture = function(a) {
  var b = this.getPicture(a);
  if (b) {
    this.selectedPicture = b, this.entity.setImage(b), this.updateThumbnailView();
  } else {
    throw Error("No picture with pictureId : " + a);
  }
};
Entry.EntryObject.prototype.addSound = function(a, b) {
  a.id || (a.id = Entry.generateHash());
  Entry.stateManager && Entry.stateManager.addCommand("add sound", this, this.removeSound, a.id);
  Entry.initSound(a, b);
  b || 0 === b ? (this.sounds.splice(b, 0, a), Entry.playground.injectSound(this)) : this.sounds.push(a);
  return new Entry.State(this, this.removeSound, a.id);
};
Entry.EntryObject.prototype.removeSound = function(a) {
  var b;
  b = this.getSound(a);
  a = this.sounds.indexOf(b);
  Entry.stateManager && Entry.stateManager.addCommand("remove sound", this, this.addSound, b, a);
  this.sounds.splice(a, 1);
  Entry.playground.reloadPlayground();
  Entry.playground.injectSound(this);
  return new Entry.State(this, this.addSound, b, a);
};
Entry.EntryObject.prototype.getRotateMethod = function() {
  this.rotateMethod || (this.rotateMethod = "free");
  return this.rotateMethod;
};
Entry.EntryObject.prototype.setRotateMethod = function(a) {
  a || (a = "free");
  this.rotateMethod = a;
  this.updateRotateMethodView();
  Entry.stage.selectedObject && Entry.stage.selectedObject.entity && (Entry.stage.updateObject(), Entry.stage.updateHandle());
};
Entry.EntryObject.prototype.initRotateValue = function(a) {
  this.rotateMethod != a && (a = this.entity, a.rotation = 0, a.direction = 90, a.flip = !1);
};
Entry.EntryObject.prototype.updateRotateMethodView = function() {
  var a = this.rotateMethod;
  this.rotateModeAView_ && (this.rotateModeAView_.removeClass("selected"), this.rotateModeBView_.removeClass("selected"), this.rotateModeCView_.removeClass("selected"), "free" == a ? this.rotateModeAView_.addClass("selected") : "vertical" == a ? this.rotateModeBView_.addClass("selected") : this.rotateModeCView_.addClass("selected"), this.updateRotationView());
};
Entry.EntryObject.prototype.toggleInformation = function(a) {
  this.setRotateMethod(this.getRotateMethod());
  void 0 === a && (a = this.isInformationToggle = !this.isInformationToggle);
  a ? this.view_.addClass("informationToggle") : this.view_.removeClass("informationToggle");
};
Entry.EntryObject.prototype.addCloneEntity = function(a, b, c) {
  this.clonedEntities.length > Entry.maxCloneLimit || (a = new Entry.EntityObject(this), b ? (a.injectModel(b.picture ? b.picture : null, b.toJSON()), a.snapshot_ = b.snapshot_, b.effect && (a.effect = Entry.cloneSimpleObject(b.effect), a.applyFilter()), b.brush && Entry.setCloneBrush(a, b.brush)) : (a.injectModel(this.entity.picture ? this.entity.picture : null, this.entity.toJSON(a)), a.snapshot_ = this.entity.snapshot_, this.entity.effect && (a.effect = Entry.cloneSimpleObject(this.entity.effect), 
  a.applyFilter()), this.entity.brush && Entry.setCloneBrush(a, this.entity.brush)), Entry.engine.raiseEventOnEntity(a, [a, "when_clone_start"]), a.isClone = !0, a.isStarted = !0, this.addCloneVariables(this, a, b ? b.variables : null, b ? b.lists : null), this.clonedEntities.push(a), Entry.stage.loadEntity(a));
};
Entry.EntryObject.prototype.initializeSplitter = function(a) {
  a.onmousedown = function(b) {
    Entry.container.disableSort();
    Entry.container.splitterEnable = !0;
  };
  document.addEventListener("mousemove", function(b) {
    Entry.container.splitterEnable && Entry.resizeElement({canvasWidth:b.x || b.clientX});
  });
  document.addEventListener("mouseup", function(b) {
    Entry.container.splitterEnable = !1;
    Entry.container.enableSort();
  });
};
Entry.EntryObject.prototype.isSelected = function() {
  return this.isSelected_;
};
Entry.EntryObject.prototype.toJSON = function() {
  var a = {};
  a.id = this.id;
  a.name = this.name;
  "textBox" == this.objectType && (a.text = this.text);
  a.script = this.getScriptText();
  "sprite" == this.objectType && (a.selectedPictureId = this.selectedPicture.id);
  a.objectType = this.objectType;
  a.rotateMethod = this.getRotateMethod();
  a.scene = this.scene.id;
  a.sprite = {pictures:Entry.getPicturesJSON(this.pictures), sounds:Entry.getSoundsJSON(this.sounds)};
  a.lock = this.lock;
  a.entity = this.entity.toJSON();
  return a;
};
Entry.EntryObject.prototype.destroy = function() {
  Entry.stage.unloadEntity(this.entity);
  this.view_ && Entry.removeElement(this.view_);
};
Entry.EntryObject.prototype.getSound = function(a) {
  a = a.trim();
  for (var b = this.sounds, c = b.length, d = 0;d < c;d++) {
    if (b[d].id == a) {
      return b[d];
    }
  }
  for (d = 0;d < c;d++) {
    if (b[d].name == a) {
      return b[d];
    }
  }
  a = Entry.parseNumber(a);
  if ((!1 !== a || "boolean" != typeof a) && c >= a && 0 < a) {
    return b[a - 1];
  }
  throw Error("No Sound");
};
Entry.EntryObject.prototype.addCloneVariables = function(a, b, c, d) {
  b.variables = [];
  b.lists = [];
  c || (c = Entry.findObjsByKey(Entry.variableContainer.variables_, "object_", a.id));
  d || (d = Entry.findObjsByKey(Entry.variableContainer.lists_, "object_", a.id));
  for (a = 0;a < c.length;a++) {
    b.variables.push(c[a].clone());
  }
  for (a = 0;a < d.length;a++) {
    b.lists.push(d[a].clone());
  }
};
Entry.EntryObject.prototype.getLock = function() {
  return this.lock;
};
Entry.EntryObject.prototype.setLock = function(a) {
  this.lock = a;
  Entry.stage.updateObject();
  return a;
};
Entry.EntryObject.prototype.updateInputViews = function(a) {
  a = a || this.getLock();
  var b = [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
  if (a && 1 != b[0].getAttribute("readonly")) {
    for (a = 0;a < b.length;a++) {
      b[a].removeClass("selectedEditingObject"), b[a].setAttribute("readonly", !1), this.isEditing = !1;
    }
  }
};
Entry.EntryObject.prototype.editObjectValues = function(a) {
  var b;
  b = this.getLock() ? [this.nameView_] : [this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
  if (a) {
    var c = this.nameView_;
    $(b).removeClass("selectedNotEditingObject");
    $(c).removeClass("selectedNotEditingObject");
    window.setTimeout(function() {
      $(c).removeAttr("readonly");
      c.addClass("selectedEditingObject");
    });
    for (a = 0;a < b.length;a++) {
      $(b[a]).removeAttr("readonly"), b[a].addClass("selectedEditingObject");
    }
    this.isEditing = !0;
  } else {
    for (a = 0;a < b.length;a++) {
      b[a].blur(!0);
    }
    this.nameView_.blur(!0);
    this.blurAllInput();
    this.isEditing = !1;
  }
};
Entry.EntryObject.prototype.blurAllInput = function() {
  var a = document.getElementsByClassName("selectedEditingObject");
  $(a).removeClass("selectedEditingObject");
  for (var a = [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_], b = 0;b < a.length;b++) {
    a[b].addClass("selectedNotEditingObject"), a[b].setAttribute("readonly", !0);
  }
};
Entry.EntryObject.prototype.addStampEntity = function(a) {
  a = new Entry.StampEntity(this, a);
  Entry.stage.loadEntity(a);
  this.clonedEntities.push(a);
  Entry.stage.sortZorder();
};
Entry.EntryObject.prototype.getClonedEntities = function() {
  var a = [];
  this.clonedEntities.map(function(b) {
    b.isStamp || a.push(b);
  });
  return a;
};
Entry.EntryObject.prototype.getStampEntities = function() {
  var a = [];
  this.clonedEntities.map(function(b) {
    b.isStamp && a.push(b);
  });
  return a;
};
Entry.EntryObject.prototype.clearExecutor = function() {
  this.script.clearExecutors();
  for (var a = this.clonedEntities.length;0 < a;a--) {
    this.clonedEntities[a - 1].removeClone();
  }
  this.clonedEntities = [];
};
Entry.EntryObject.prototype._rightClick = function(a) {
  var b = this, c = [{text:Lang.Workspace.context_rename, callback:function(a) {
    a.stopPropagation();
    b.setLock(!1);
    b.editObjectValues(!0);
    b.nameView_.select();
  }}, {text:Lang.Workspace.context_duplicate, enable:!Entry.engine.isState("run"), callback:function() {
    Entry.container.addCloneObject(b);
  }}, {text:Lang.Workspace.context_remove, callback:function() {
    Entry.container.removeObject(b);
  }}, {text:Lang.Workspace.copy_file, callback:function() {
    Entry.container.setCopiedObject(b);
  }}, {text:Lang.Blocks.Paste_blocks, enable:!Entry.engine.isState("run") && !!Entry.container.copiedObject, callback:function() {
    Entry.container.copiedObject ? Entry.container.addCloneObject(Entry.container.copiedObject) : Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.object_not_found_for_paste);
  }}];
  a = Entry.Utils.convertMouseEvent(a);
  Entry.ContextMenu.show(c, "workspace-contextmenu", {x:a.clientX, y:a.clientY});
};
Entry.Painter = function() {
  this.toolbox = {selected:"cursor"};
  this.stroke = {enabled:!1, fillColor:"#000000", lineColor:"#000000", thickness:1, fill:!0, transparent:!1, style:"line", locked:!1};
  this.file = {id:Entry.generateHash(), name:"\uc0c8\uadf8\ub9bc", modified:!1, mode:"new"};
  this.font = {name:"KoPub Batang", size:20, style:"normal"};
  this.selectArea = {};
  this.firstStatement = !1;
};
Entry.Painter.prototype.initialize = function(a) {
  this.generateView(a);
  this.canvas = document.getElementById("entryPainterCanvas");
  this.canvas_ = document.getElementById("entryPainterCanvas_");
  this.stage = new createjs.Stage(this.canvas);
  this.stage.autoClear = !0;
  this.stage.enableDOMEvents(!0);
  this.stage.enableMouseOver(10);
  this.stage.mouseMoveOutside = !0;
  createjs.Touch.enable(this.stage);
  this.objectContainer = new createjs.Container;
  this.objectContainer.name = "container";
  this.stage.addChild(this.objectContainer);
  this.ctx = this.stage.canvas.getContext("2d");
  this.ctx.imageSmoothingEnabled = !1;
  this.ctx.webkitImageSmoothingEnabled = !1;
  this.ctx.mozImageSmoothingEnabled = !1;
  this.ctx.msImageSmoothingEnabled = !1;
  this.ctx.oImageSmoothingEnabled = !1;
  this.ctx_ = this.canvas_.getContext("2d");
  this.initDashedLine();
  this.initPicture();
  this.initCoordinator();
  this.initHandle();
  this.initDraw();
  var b = this;
  Entry.addEventListener("textUpdate", function() {
    var a = b.inputField.value();
    "" === a ? (b.inputField.hide(), delete b.inputField) : (b.inputField.hide(), b.drawText(a), b.selectToolbox("cursor"));
  });
  this.selectToolbox("cursor");
};
Entry.Painter.prototype.initHandle = function() {
  this._handle = new createjs.Container;
  this._handle.rect = new createjs.Shape;
  this._handle.addChild(this._handle.rect);
  var a = new createjs.Container;
  a.name = "move";
  a.width = 90;
  a.height = 90;
  a.x = 90;
  a.y = 90;
  a.rect = new createjs.Shape;
  var b = this;
  a.rect.on("mousedown", function(c) {
    "cursor" === b.toolbox.selected && (b.initCommand(), this.offset = {x:this.parent.x - this.x - c.stageX, y:this.parent.y - this.y - c.stageY}, this.parent.handleMode = "move", a.isSelectCenter = !1);
  });
  a.rect.on("pressmove", function(c) {
    "cursor" !== b.toolbox.selected || a.isSelectCenter || (b.doCommand(), this.parent.x = c.stageX + this.offset.x, this.parent.y = c.stageY + this.offset.y, b.updateImageHandle());
  });
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  a.rect.cursor = "move";
  a.addChild(a.rect);
  a.notch = new createjs.Shape;
  a.addChild(a.notch);
  a.NEHandle = this.generateCornerHandle();
  a.addChild(a.NEHandle);
  a.NWHandle = this.generateCornerHandle();
  a.addChild(a.NWHandle);
  a.SWHandle = this.generateCornerHandle();
  a.addChild(a.SWHandle);
  a.SEHandle = this.generateCornerHandle();
  a.addChild(a.SEHandle);
  a.EHandle = this.generateXHandle();
  a.addChild(a.EHandle);
  a.WHandle = this.generateXHandle();
  a.addChild(a.WHandle);
  a.NHandle = this.generateYHandle();
  a.addChild(a.NHandle);
  a.SHandle = this.generateYHandle();
  a.addChild(a.SHandle);
  a.RHandle = new createjs.Shape;
  a.RHandle.graphics.ss(2, 2, 0).beginFill("#888").s("#c1c7cd").f("#c1c7cd").dr(-2, -2, 8, 8);
  a.RHandle.on("mousedown", function(a) {
    b.initCommand();
  });
  a.RHandle.on("pressmove", function(a) {
    b.doCommand();
    var c = a.stageX - this.parent.x;
    a = a.stageY - this.parent.y;
    this.parent.rotation = 0 <= c ? Math.atan(a / c) / Math.PI * 180 + 90 : Math.atan(a / c) / Math.PI * 180 + 270;
    b.updateImageHandle();
  });
  a.RHandle.cursor = "crosshair";
  a.addChild(a.RHandle);
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  a.visible = !1;
  this.handle = a;
  this.stage.addChild(a);
  this.updateImageHandleCursor();
};
Entry.Painter.prototype.generateCornerHandle = function() {
  var a = this, b = new createjs.Shape;
  b.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  b.on("mousedown", function(b) {
    a.initCommand();
    this.offset = {x:b.stageX - this.parent.x + this.parent.regX, y:b.stageY - this.parent.y + this.parent.regY};
  });
  b.on("pressmove", function(b) {
    a.doCommand();
    var c = Math.sqrt(Math.abs((b.stageX - this.parent.x + this.parent.regX) / this.offset.x * (b.stageY - this.parent.y + this.parent.regY) / this.offset.y));
    10 < this.parent.width * c && 10 < this.parent.height * c && (this.parent.width *= c, this.parent.height *= c, this.offset = {x:b.stageX - this.parent.x + this.parent.regX, y:b.stageY - this.parent.y + this.parent.regY});
    a.updateImageHandle();
  });
  b.on("mouseup", function(b) {
    a.checkCommand();
  });
  return b;
};
Entry.Painter.prototype.generateXHandle = function() {
  var a = this, b = new createjs.Shape;
  b.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  b.on("mousedown", function(b) {
    a.initCommand();
    this.offset = {x:b.stageX - this.parent.x + this.parent.regX};
  });
  b.on("pressmove", function(b) {
    a.doCommand();
    var c = Math.abs((b.stageX - this.parent.x + this.parent.regX) / this.offset.x);
    10 < this.parent.width * c && (this.parent.width *= c, this.offset = {x:b.stageX - this.parent.x + this.parent.regX});
    a.updateImageHandle();
  });
  b.on("mouseup", function(b) {
    a.checkCommand();
  });
  return b;
};
Entry.Painter.prototype.generateYHandle = function() {
  var a = this, b = new createjs.Shape;
  b.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  b.on("mousedown", function(b) {
    a.initCommand();
    this.offset = {y:b.stageY - this.parent.y + this.parent.regY};
  });
  b.on("pressmove", function(b) {
    a.doCommand();
    var c = Math.abs((b.stageY - this.parent.y + this.parent.regY) / this.offset.y);
    10 < this.parent.height * c && (this.parent.height *= c, this.offset = {y:b.stageY - this.parent.y + this.parent.regY});
    a.updateImageHandle();
  });
  b.on("mouseup", function(b) {
    a.checkCommand();
  });
  return b;
};
Entry.Painter.prototype.updateImageHandle = function() {
  if (this.handle.visible) {
    var a = this.handle, b = a.direction, c = a.width, d = a.height, e = a.regX, f = a.regY;
    a.rect.graphics.clear().f("rgba(0,0,1,0.01)").ss(2, 2, 0).s("#c1c7cd").lt(-c / 2, -d / 2).lt(0, -d / 2).lt(0, -d / 2).lt(+c / 2, -d / 2).lt(+c / 2, +d / 2).lt(-c / 2, +d / 2).cp();
    a.notch.graphics.clear().f("rgba(0,0,1,0.01)").ss(2, 2, 0).s("#c1c7cd").lt(0, -d / 2).lt(0, -d / 2 - 20).cp();
    a.NEHandle.x = +a.width / 2;
    a.NEHandle.y = -a.height / 2;
    a.NWHandle.x = -a.width / 2;
    a.NWHandle.y = -a.height / 2;
    a.SWHandle.x = -a.width / 2;
    a.SWHandle.y = +a.height / 2;
    a.SEHandle.x = +a.width / 2;
    a.SEHandle.y = +a.height / 2;
    a.EHandle.x = +a.width / 2;
    a.EHandle.y = 0;
    a.WHandle.x = -a.width / 2;
    a.WHandle.y = 0;
    a.NHandle.x = 0;
    a.NHandle.y = -a.height / 2;
    a.SHandle.x = 0;
    a.SHandle.y = +a.height / 2;
    a.RHandle.x = -2;
    a.RHandle.y = -a.height / 2 - 20 - 2;
    this.handle.visible && (c = this.selectedObject, this.selectedObject.text ? (c.width = this.selectedObject.width, c.height = this.selectedObject.height) : (c.width = c.image.width, c.height = c.image.height), c.scaleX = a.width / c.width, c.scaleY = a.height / c.height, c.x = a.x, c.y = a.y, c.regX = c.width / 2 + e / c.scaleX, c.regY = c.height / 2 + f / c.scaleY, c.rotation = a.rotation, c.direction = b, this.selectArea.x1 = a.x - a.width / 2, this.selectArea.y1 = a.y - a.height / 2, this.selectArea.x2 = 
    a.width, this.selectArea.y2 = a.height, this.objectWidthInput.value = Math.abs(c.width * c.scaleX).toFixed(0), this.objectHeightInput.value = Math.abs(c.height * c.scaleY).toFixed(0), this.objectRotateInput.value = (1 * c.rotation).toFixed(0));
    this.updateImageHandleCursor();
    this.stage.update();
  }
};
Entry.Painter.prototype.updateImageHandleCursor = function() {
  var a = this.handle;
  a.rect.cursor = "move";
  a.RHandle.cursor = "crosshair";
  for (var b = ["nwse-resize", "ns-resize", "nesw-resize", "ew-resize"], c = Math.floor((a.rotation + 22.5) % 180 / 45), d = 0;d < c;d++) {
    b.push(b.shift());
  }
  a.NHandle.cursor = b[1];
  a.NEHandle.cursor = b[2];
  a.EHandle.cursor = b[3];
  a.SEHandle.cursor = b[0];
  a.SHandle.cursor = b[1];
  a.SWHandle.cursor = b[2];
  a.WHandle.cursor = b[3];
  a.NWHandle.cursor = b[0];
};
Entry.Painter.prototype.clearCanvas = function(a) {
  this.clearHandle();
  a || this.initCommand();
  this.objectContainer.removeAllChildren();
  this.stage.update();
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  a = 0;
  for (var b = this.colorLayerData.data.length;a < b;a++) {
    this.colorLayerData.data[a] = 255, this.colorLayerData.data[a + 1] = 255, this.colorLayerData.data[a + 2] = 255, this.colorLayerData.data[a + 3] = 255;
  }
  this.reloadContext();
};
Entry.Painter.prototype.newPicture = function() {
  var a = {dimension:{height:1, width:1}, fileurl:Entry.mediaFilePath + "_1x1.png", name:Lang.Workspace.new_picture};
  a.id = Entry.generateHash();
  Entry.playground.addPicture(a, !0);
};
Entry.Painter.prototype.initPicture = function() {
  var a = this;
  Entry.addEventListener("pictureSelected", function(b) {
    a.selectToolbox("cursor");
    if (a.file.id !== b.id) {
      a.file.modified && confirm("\uc218\uc815\ub41c \ub0b4\uc6a9\uc744 \uc800\uc7a5\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?") && (a.file_ = JSON.parse(JSON.stringify(a.file)), a.file_save(!0));
      a.file.modified = !1;
      a.clearCanvas(!0);
      var c = new Image;
      c.id = b.id ? b.id : Entry.generateHash();
      a.file.id = c.id;
      a.file.name = b.name;
      a.file.mode = "edit";
      c.src = b.fileurl ? b.fileurl : Entry.defaultPath + "/uploads/" + b.filename.substring(0, 2) + "/" + b.filename.substring(2, 4) + "/image/" + b.filename + ".png";
      c.onload = function(b) {
        a.addImage(b.target);
      };
    }
  });
  Entry.addEventListener("pictureImport", function(b) {
    a.addPicture(b);
  });
  Entry.addEventListener("pictureNameChanged", function(b) {
    a.file.name = b.name;
  });
  Entry.addEventListener("pictureClear", function(b) {
    a.file.modified = !1;
    a.file.id = "";
    a.file.name = "";
    a.clearCanvas();
  });
};
Entry.Painter.prototype.initDraw = function() {
  var a = this;
  this.stage.on("stagemousedown", function(b) {
    a.stagemousedown(b);
  });
  this.stage.on("stagemouseup", function(b) {
    a.stagemouseup(b);
  });
  this.stage.on("stagemousemove", function(b) {
    a.stagemousemove(b);
  });
};
Entry.Painter.prototype.selectObject = function(a, b) {
  this.selectedObject = a;
  this.handle.visible = a.visible;
  b ? (this.handle.width = this.copy.width, this.handle.height = this.copy.height, this.handle.x = this.selectArea.x1 + this.copy.width / 2, this.handle.y = this.selectArea.y1 + this.copy.height / 2) : (this.handle.width = a.scaleX * a.image.width, this.handle.height = a.scaleY * a.image.height, this.handle.x = a.x, this.handle.y = a.y, this.handle.regX = +(a.regX - a.image.width / 2) * a.scaleX, this.handle.regY = +(a.regY - a.image.height / 2) * a.scaleY);
  this.handle.rotation = a.rotation;
  this.handle.direction = 0;
  this.updateImageHandle();
};
Entry.Painter.prototype.selectTextObject = function(a) {
  this.selectedObject = a;
  var b = a.getTransformedBounds();
  this.handle.visible = a.visible;
  a.width || (this.selectedObject.width = b.width);
  a.height || (this.selectedObject.height = b.height);
  this.handle.width = a.scaleX * this.selectedObject.width;
  this.handle.height = a.scaleY * this.selectedObject.height;
  this.handle.x = a.x;
  this.handle.y = a.y;
  a.regX || (a.regX = a.width / 2);
  a.regY || (a.regY = a.height / 2);
  this.handle.regX = (a.regX - this.selectedObject.width / 2) * a.scaleX;
  this.handle.regY = (a.regY - this.selectedObject.height / 2) * a.scaleY;
  this.handle.rotation = a.rotation;
  this.handle.direction = 0;
  this.updateImageHandle();
};
Entry.Painter.prototype.updateHandle = function() {
  -1 < this.stage.getChildIndex(this._handle) && this.stage.removeChild(this._handle);
  -1 === this.stage.getChildIndex(this.handle) && this.stage.addChild(this.handle);
  var a = new createjs.Shape;
  a.graphics.clear().beginFill("#000").rect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.handle.rect.hitArea = a;
  this.handle.rect.graphics.clear().setStrokeStyle(1, "round").beginStroke("#000000").drawDashedRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2, 4);
  this.stage.update();
};
Entry.Painter.prototype.updateHandle_ = function() {
  this.stage.getChildIndex(-1 < this._handle) && this.stage.addChild(this._handle);
  this._handle.rect.graphics.clear().setStrokeStyle(1, "round").beginStroke("#cccccc").drawDashedRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2, 2);
  this.stage.update();
};
Entry.Painter.prototype.matchTolerance = function(a, b, c, d, e) {
  var f = this.colorLayerData.data[a], g = this.colorLayerData.data[a + 1];
  a = this.colorLayerData.data[a + 2];
  return f >= b - e / 100 * b && f <= b + e / 100 * b && g >= c - e / 100 * c && g <= c + e / 100 * c && a >= d - e / 100 * d && a <= d + e / 100 * d;
};
Entry.Painter.prototype.matchColorOnly = function(a, b, c, d) {
  return b === this.colorLayerData.data[a] && c === this.colorLayerData.data[a + 1] && d === this.colorLayerData.data[a + 2] ? !0 : !1;
};
Entry.Painter.prototype.matchColor = function(a, b, c, d, e) {
  return b === this.colorLayerData.data[a] && c === this.colorLayerData.data[a + 1] && d === this.colorLayerData.data[a + 2] && e === this.colorLayerData.data[a + 3] ? !0 : !1;
};
Entry.Painter.prototype.colorPixel = function(a, b, c, d, e) {
  e || (e = 255);
  this.stroke.transparent && (e = d = c = b = 0);
  this.colorLayerData.data[a] = b;
  this.colorLayerData.data[a + 1] = c;
  this.colorLayerData.data[a + 2] = d;
  this.colorLayerData.data[a + 3] = e;
};
Entry.Painter.prototype.pickStrokeColor = function(a) {
  a = 4 * (Math.round(a.stageY) * this.canvas.width + Math.round(a.stageX));
  this.stroke.lineColor = Entry.rgb2hex(this.colorLayerData.data[a], this.colorLayerData.data[a + 1], this.colorLayerData.data[a + 2]);
  document.getElementById("entryPainterAttrCircle").style.backgroundColor = this.stroke.lineColor;
  document.getElementById("entryPainterAttrCircleInput").value = this.stroke.lineColor;
};
Entry.Painter.prototype.drawText = function(a) {
  var b = document.getElementById("entryPainterAttrFontStyle").value, c = document.getElementById("entryPainterAttrFontName").value, d = document.getElementById("entryPainterAttrFontSize").value;
  a = new createjs.Text(a, b + " " + d + 'px "' + c + '"', this.stroke.lineColor);
  a.textBaseline = "top";
  a.x = this.oldPt.x;
  a.y = this.oldPt.y;
  this.objectContainer.addChild(a);
  this.selectTextObject(a);
  this.file.modified = !0;
};
Entry.Painter.prototype.addImage = function(a) {
  var b = new createjs.Bitmap(a);
  this.objectContainer.addChild(b);
  b.x = this.stage.canvas.width / 2;
  b.y = this.stage.canvas.height / 2;
  b.regX = b.image.width / 2 | 0;
  b.regY = b.image.height / 2 | 0;
  if (540 < b.image.height) {
    var c = 540 / b.image.height;
    b.scaleX = c;
    b.scaleY = c;
  }
  b.name = a.id;
  b.id = a.id;
  this.selectObject(b);
  this.stage.update();
};
Entry.Painter.prototype.createBrush = function() {
  this.initCommand();
  this.brush = new createjs.Shape;
  this.objectContainer.addChild(this.brush);
  this.stage.update();
};
Entry.Painter.prototype.createEraser = function() {
  this.initCommand();
  this.eraser = new createjs.Shape;
  this.objectContainer.addChild(this.eraser);
  this.stage.update();
};
Entry.Painter.prototype.clearHandle = function() {
  this.handle.visible && (this.handle.visible = !1);
  this.coordinator.visible && (this.coordinator.visible = !1);
  this.stage.update();
};
Entry.Painter.prototype.initCommand = function() {
  var a = !1;
  this.handle.visible && (a = !0, this.handle.visible = !1);
  var b = !1;
  this.coordinator.visible && (b = !0, this.coordinator.visible = !1);
  (a || b) && this.stage.update();
  this.isCommandValid = !1;
  this.colorLayerModel = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  Entry.stateManager && this.firstStatement && Entry.stateManager.addCommand("edit sprite", this, this.restorePainter, this.colorLayerModel);
  this.firstStatement = !0;
  a && (this.handle.visible = !0);
  b && (this.coordinator.visible = !0);
  (a || b) && this.stage.update();
};
Entry.Painter.prototype.doCommand = function() {
  this.isCommandValid = !0;
};
Entry.Painter.prototype.checkCommand = function() {
  this.isCommandValid || Entry.dispatchEvent("cancelLastCommand");
};
Entry.Painter.prototype.restorePainter = function(a) {
  this.clearHandle();
  var b = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(a, 0, 0);
  a = new Image;
  a.src = this.canvas.toDataURL();
  var c = this;
  a.onload = function(b) {
    b = new createjs.Bitmap(b.target);
    c.objectContainer.removeAllChildren();
    c.objectContainer.addChild(b);
  };
  Entry.stateManager && Entry.stateManager.addCommand("restore sprite", this, this.restorePainter, b);
};
Entry.Painter.prototype.platten = function() {
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.reloadContext();
};
Entry.Painter.prototype.fill = function() {
  if (!this.stroke.locked) {
    this.stroke.locked = !0;
    this.initCommand();
    this.doCommand();
    this.clearHandle();
    var a = this.canvas.width, b = this.canvas.height;
    this.colorLayerData = this.ctx.getImageData(0, 0, a, b);
    var c = new createjs.Point(this.stage.mouseX, this.stage.mouseY);
    c.x = Math.round(c.x);
    c.y = Math.round(c.y);
    for (var d = 4 * (c.y * a + c.x), e = this.colorLayerData.data[d], f = this.colorLayerData.data[d + 1], g = this.colorLayerData.data[d + 2], h = this.colorLayerData.data[d + 3], k, m, c = [[c.x, c.y]], l = Entry.hex2rgb(this.stroke.lineColor);c.length;) {
      for (var d = c.pop(), n = d[0], q = d[1], d = 4 * (q * a + n);0 <= q && this.matchColor(d, e, f, g, h);) {
        --q, d -= 4 * a;
      }
      d += 4 * a;
      q += 1;
      for (m = k = !1;q < b - 1 && this.matchColor(d, e, f, g, h);) {
        q += 1, this.colorPixel(d, l.r, l.g, l.b), 0 < n && (this.matchColor(d - 4, e, f, g, h) ? k || (c.push([n - 1, q]), k = !0) : k && (k = !1)), n < a - 1 && (this.matchColor(d + 4, e, f, g, h) ? m || (c.push([n + 1, q]), m = !0) : m && (m = !1)), d += 4 * a;
      }
      if (1080 < c.length) {
        break;
      }
    }
    this.file.modified = !0;
    this.reloadContext();
  }
};
Entry.Painter.prototype.reloadContext = function() {
  delete this.selectedObject;
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(this.colorLayerData, 0, 0);
  var a = new Image;
  a.src = this.canvas.toDataURL();
  var b = this;
  a.onload = function(a) {
    a = new createjs.Bitmap(a.target);
    b.objectContainer.removeAllChildren();
    b.objectContainer.addChild(a);
    b.stroke.locked = !1;
  };
};
Entry.Painter.prototype.move_pen = function() {
  var a = new createjs.Point(this.oldPt.x + this.stage.mouseX >> 1, this.oldPt.y + this.stage.mouseY >> 1);
  this.brush.graphics.setStrokeStyle(this.stroke.thickness, "round").beginStroke(this.stroke.lineColor).moveTo(a.x, a.y).curveTo(this.oldPt.x, this.oldPt.y, this.oldMidPt.x, this.oldMidPt.y);
  this.oldPt.x = this.stage.mouseX;
  this.oldPt.y = this.stage.mouseY;
  this.oldMidPt.x = a.x;
  this.oldMidPt.y = a.y;
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_line = function() {
  this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").moveTo(this.oldPt.x, this.oldPt.y).lineTo(this.stage.mouseX, this.stage.mouseY);
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_rect = function() {
  var a = this.stage.mouseX - this.oldPt.x, b = this.stage.mouseY - this.oldPt.y;
  event.shiftKey && (b = a);
  this.stroke.fill ? 0 === this.stroke.thickness ? this.brush.graphics.clear().setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawRect(this.oldPt.x, this.oldPt.y, a, b) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawRect(this.oldPt.x, this.oldPt.y, a, b) : 0 === this.stroke.thickness ? this.brush.graphics.clear().setStrokeStyle(this.stroke.thickness, "round").drawRect(this.oldPt.x, 
  this.oldPt.y, a, b) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").drawRect(this.oldPt.x, this.oldPt.y, a, b);
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_circle = function() {
  var a = this.stage.mouseX - this.oldPt.x, b = this.stage.mouseY - this.oldPt.y;
  event.shiftKey && (b = a);
  this.stroke.fill ? 0 === this.stroke.thickness ? this.brush.graphics.clear().beginStroke(this.stroke.fillColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawEllipse(this.oldPt.x, this.oldPt.y, a, b) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawEllipse(this.oldPt.x, this.oldPt.y, a, b) : this.stroke.fill || (0 === this.stroke.thickness ? this.brush.graphics.clear().drawEllipse(this.oldPt.x, 
  this.oldPt.y, a, b) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").drawEllipse(this.oldPt.x, this.oldPt.y, a, b));
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.edit_copy = function() {
  this.selectArea ? (this.clearHandle(), this.selectedObject && delete this.selectedObject, this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.copy = {}, this.copy.width = this.selectArea.x2, this.copy.height = this.selectArea.y2, this.canvas_.width = this.copy.width, this.canvas_.height = this.copy.height, this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height), this.ctx_.putImageData(this.copyLayerData, 0, 
  0)) : alert("\ubcf5\uc0ac\ud560 \uc601\uc5ed\uc744 \uc120\ud0dd\ud558\uc138\uc694.");
};
Entry.Painter.prototype.edit_cut = function() {
  this.selectArea ? (this.clearHandle(), this.selectedObject && delete this.selectedObject, this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.copy = {}, this.copy.width = this.selectArea.x2, this.copy.height = this.selectArea.y2, this.canvas_.width = this.copy.width, this.canvas_.height = this.copy.height, this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height), this.ctx_.putImageData(this.copyLayerData, 0, 
  0), this.ctx.clearRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height), this.reloadContext(), this.file.modified = !0) : alert("\uc790\ub97c \uc601\uc5ed\uc744 \uc120\ud0dd\ud558\uc138\uc694.");
};
Entry.Painter.prototype.edit_paste = function() {
  var a = new Image;
  a.src = this.canvas_.toDataURL();
  var b = this;
  a.onload = function(a) {
    a = new createjs.Bitmap(a.target);
    a.x = b.canvas.width / 2;
    a.y = b.canvas.height / 2;
    a.regX = b.copy.width / 2 | 0;
    a.regY = b.copy.height / 2 | 0;
    a.id = Entry.generateHash();
    b.objectContainer.addChild(a);
    b.selectObject(a, !0);
  };
  this.file.modified = !0;
};
Entry.Painter.prototype.edit_select = function() {
  this.clearHandle();
  this.selectedObject && delete this.selectedObject;
  this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.copy = {};
  this.copy.width = this.selectArea.x2;
  this.copy.height = this.selectArea.y2;
  this.canvas_.width = this.copy.width;
  this.canvas_.height = this.copy.height;
  this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
  this.ctx_.putImageData(this.copyLayerData, 0, 0);
  this.ctx.clearRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(this.colorLayerData, 0, 0);
  var a = new Image;
  a.src = this.canvas.toDataURL();
  var b = this;
  a.onload = function(a) {
    a = new createjs.Bitmap(a.target);
    b.objectContainer.removeAllChildren();
    b.objectContainer.addChild(a);
    a = new Image;
    a.src = b.canvas_.toDataURL();
    a.onload = function(a) {
      a = new createjs.Bitmap(a.target);
      a.x = b.selectArea.x1 + b.copy.width / 2;
      a.y = b.selectArea.y1 + b.copy.height / 2;
      a.regX = b.copy.width / 2 | 0;
      a.regY = b.copy.height / 2 | 0;
      a.id = Entry.generateHash();
      a.name = a.id;
      b.objectContainer.addChild(a);
      b.selectObject(a, !0);
    };
  };
};
Entry.Painter.prototype.move_erase = function(a) {
  a = new createjs.Point(this.oldPt.x + this.stage.mouseX >> 1, this.oldPt.y + this.stage.mouseY >> 1);
  this.eraser.graphics.setStrokeStyle(this.stroke.thickness, "round").beginStroke("#ffffff").moveTo(a.x, a.y).curveTo(this.oldPt.x, this.oldPt.y, this.oldMidPt.x, this.oldMidPt.y);
  this.oldPt.x = this.stage.mouseX;
  this.oldPt.y = this.stage.mouseY;
  this.oldMidPt.x = a.x;
  this.oldMidPt.y = a.y;
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.settingShapeBlur = function() {
  this.objectWidthInput.blur();
  this.objectHeightInput.blur();
  this.objectRotateInput.blur();
};
Entry.Painter.prototype.stagemousedown = function(a) {
  "picture" == Entry.playground.getViewMode() && (this.settingShapeBlur(), this.oldPt = new createjs.Point(a.stageX, a.stageY), this.oldMidPt = this.oldPt.clone(), "select" === this.toolbox.selected ? this.stage.addChild(this._handle) : "spoid" === this.toolbox.selected ? this.pickStrokeColor(a) : "text" === this.toolbox.selected ? (this.showInputField(a), this.stage.update()) : "erase" === this.toolbox.selected ? (this.createEraser(), this.stroke.enabled = !0) : "fill" === this.toolbox.selected ? 
  this.fill() : "cursor" !== this.toolbox.selected && (this.createBrush(), this.stroke.enabled = !0));
};
Entry.Painter.prototype.stagemousemove = function(a) {
  "picture" == Entry.playground.getViewMode() && ("select" === this.toolbox.selected && -1 < this.stage.getChildIndex(this._handle) ? (this.selectArea.x1 = this.oldPt.x, this.selectArea.y1 = this.oldPt.y, this.selectArea.x2 = a.stageX - this.oldPt.x, this.selectArea.y2 = a.stageY - this.oldPt.y, this.updateHandle_()) : this.stroke.enabled && (this.doCommand(), "pen" === this.toolbox.selected ? this.move_pen(a) : "line" === this.toolbox.selected ? this.move_line(a) : "rect" === this.toolbox.selected ? 
  this.move_rect(a) : "circle" === this.toolbox.selected ? this.move_circle(a) : "erase" === this.toolbox.selected && this.move_erase(a)), this.painterTopStageXY.innerHTML = "x:" + a.stageX.toFixed(1) + ", y:" + a.stageY.toFixed(1));
};
Entry.Painter.prototype.stagemouseup = function(a) {
  "picture" == Entry.playground.getViewMode() && ("select" === this.toolbox.selected ? (this.selectArea.x1 = this.oldPt.x, this.selectArea.y1 = this.oldPt.y, this.selectArea.x2 = a.stageX - this.oldPt.x, this.selectArea.y2 = a.stageY - this.oldPt.y, this.stage.removeChild(this._handle), this.stage.update(), 0 < this.selectArea.x2 && 0 < this.selectArea.y2 && this.edit_select(), this.selectToolbox("cursor")) : "cursor" !== this.toolbox.selected && this.stroke.enabled && (-1 < this.objectContainer.getChildIndex(this.eraser) && 
  this.eraser.graphics.endStroke(), -1 < this.objectContainer.getChildIndex(this.brush) && this.brush.graphics.endStroke(), this.clearHandle(), this.platten(), this.stroke.enabled = !1, this.checkCommand()));
};
Entry.Painter.prototype.file_save = function(a) {
  this.clearHandle();
  this.transparent();
  this.trim();
  var b = this.canvas_.toDataURL();
  Entry.dispatchEvent("saveCanvasImage", {file:a ? this.file_ : this.file, image:b});
  this.file.modified = !1;
};
Entry.Painter.prototype.transparent = function() {
  var a = this.canvas.width, b = this.canvas.height;
  this.colorLayerData = this.ctx.getImageData(0, 0, a, b);
  var c = a * (b - 1) * 4, d = 4 * (a - 1), e = 4 * (a * b - 1);
  this.matchColorOnly(0, 255, 255, 255) ? this.fillTransparent(1, 1) : this.matchColorOnly(c, 255, 255, 255) ? this.fillTransparent(1, b) : this.matchColorOnly(d, 255, 255, 255) ? this.fillTransparent(a, 1) : this.matchColorOnly(e, 255, 255, 255) && this.fillTransparent(a, b);
};
Entry.Painter.prototype.fillTransparent = function(a, b) {
  this.stage.mouseX = a;
  this.stage.mouseY = b;
  this.stroke.transparent = !0;
  this.fill();
};
Entry.Painter.prototype.trim = function() {
  var a = this.canvas.width, b = this.ctx.getImageData(0, 0, a, this.canvas.height), c = b.data.length, d, e = null, f = null, g = null, h = null, k;
  for (d = 0;d < c;d += 4) {
    0 !== b.data[d + 3] && (g = d / 4 % a, k = ~~(d / 4 / a), null === e && (e = k), null === f ? f = g : g < f && (f = g), null === h ? h = k : h < k && (h = k));
  }
  a = h - e;
  b = g - f;
  0 === a || 0 === b ? (e = this.ctx.getImageData(0, 0, 1, 1), e.data[0] = 255, e.data[1] = 255, e.data[2] = 255, e.data[3] = 255, this.canvas_.width = 1, this.canvas_.height = 1) : (e = this.ctx.getImageData(f, e, b, a), this.canvas_.width = b, this.canvas_.height = a);
  this.ctx_.putImageData(e, 0, 0);
};
Entry.Painter.prototype.showInputField = function(a) {
  this.inputField ? (Entry.dispatchEvent("textUpdate"), delete this.inputField) : (this.initCommand(), this.doCommand(), this.inputField = new CanvasInput({canvas:document.getElementById("entryPainterCanvas"), fontSize:20, fontFamily:this.font.name, fontColor:"#000", width:650, padding:8, borderWidth:1, borderColor:"#000", borderRadius:3, boxShadow:"1px 1px 0px #fff", innerShadow:"0px 0px 5px rgba(0, 0, 0, 0.5)", x:a.stageX, y:a.stageY, onsubmit:function() {
    Entry.dispatchEvent("textUpdate");
  }}), this.inputField.show());
};
Entry.Painter.prototype.addPicture = function(a) {
  this.initCommand();
  var b = new Image;
  b.id = Entry.generateHash();
  b.src = a.fileurl ? a.fileurl : Entry.defaultPath + "/uploads/" + a.filename.substring(0, 2) + "/" + a.filename.substring(2, 4) + "/image/" + a.filename + ".png";
  var c = this;
  b.onload = function(b) {
    c.addImage(b.target);
    c.selectToolbox("cursor");
  };
};
Entry.Painter.prototype.initCoordinator = function() {
  var a = new createjs.Container, b = new createjs.Bitmap(Entry.mediaFilePath + "/workspace_coordinate.png");
  a.addChild(b);
  this.stage.addChild(a);
  a.visible = !1;
  this.coordinator = a;
};
Entry.Painter.prototype.toggleCoordinator = function() {
  this.coordinator.visible = !this.coordinator.visible;
  this.stage.update();
};
Entry.Painter.prototype.initDashedLine = function() {
  createjs.Graphics.prototype.dashedLineTo = function(a, b, c, d, e) {
    this.moveTo(a, b);
    var f = c - a, g = d - b;
    e = Math.floor(Math.sqrt(f * f + g * g) / e);
    for (var f = f / e, g = g / e, h = 0;h++ < e;) {
      a += f, b += g, this[0 === h % 2 ? "moveTo" : "lineTo"](a, b);
    }
    this[0 === h % 2 ? "moveTo" : "lineTo"](c, d);
    return this;
  };
  createjs.Graphics.prototype.drawDashedRect = function(a, b, c, d, e) {
    this.moveTo(a, b);
    c = a + c;
    d = b + d;
    this.dashedLineTo(a, b, c, b, e);
    this.dashedLineTo(c, b, c, d, e);
    this.dashedLineTo(c, d, a, d, e);
    this.dashedLineTo(a, d, a, b, e);
    return this;
  };
  createjs.Graphics.prototype.drawResizableDashedRect = function(a, b, c, d, e, f) {
    this.moveTo(a, b);
    c = a + c;
    d = b + d;
    this.dashedLineTo(a + f, b, c - f, b, e);
    this.dashedLineTo(c, b + f, c, d - f, e);
    this.dashedLineTo(c - f, d, a + f, d, e);
    this.dashedLineTo(a, d - f, a, b + f, e);
    return this;
  };
};
Entry.Painter.prototype.generateView = function(a) {
  var b = this;
  this.view_ = a;
  if (!Entry.type || "workspace" == Entry.type) {
    this.view_.addClass("entryPainterWorkspace");
    var c = Entry.createElement("div", "entryPainterTop");
    c.addClass("entryPlaygroundPainterTop");
    this.view_.appendChild(c);
    var d = Entry.createElement("div", "entryPainterToolbox");
    d.addClass("entryPlaygroundPainterToolbox");
    this.view_.appendChild(d);
    var e = Entry.createElement("div", "entryPainterToolboxTop");
    e.addClass("entryPainterToolboxTop");
    d.appendChild(e);
    var f = Entry.createElement("div", "entryPainterContainer");
    f.addClass("entryPlaygroundPainterContainer");
    this.view_.appendChild(f);
    e = Entry.createElement("canvas", "entryPainterCanvas");
    e.width = 960;
    e.height = 540;
    e.addClass("entryPlaygroundPainterCanvas");
    f.appendChild(e);
    e = Entry.createElement("canvas", "entryPainterCanvas_");
    e.addClass("entryRemove");
    e.width = 960;
    e.height = 540;
    f.appendChild(e);
    var g = Entry.createElement("div", "entryPainterAttr");
    g.addClass("entryPlaygroundPainterAttr");
    this.view_.appendChild(g);
    this.flipObject = Entry.createElement("div", "entryPictureFlip");
    this.flipObject.addClass("entryPlaygroundPainterFlip");
    g.appendChild(this.flipObject);
    e = Entry.createElement("div", "entryPictureFlipX");
    e.title = "\uc88c\uc6b0\ub4a4\uc9d1\uae30";
    e.bindOnClick(function() {
      b.selectedObject && (b.selectedObject.scaleX *= -1, b.selectedObject.text ? b.selectTextObject(b.selectedObject) : b.selectObject(b.selectedObject), b.updateImageHandle(), b.stage.update());
    });
    e.addClass("entryPlaygroundPainterFlipX");
    this.flipObject.appendChild(e);
    e = Entry.createElement("div", "entryPictureFlipY");
    e.title = "\uc0c1\ud558\ub4a4\uc9d1\uae30";
    e.bindOnClick(function() {
      b.selectedObject && (b.selectedObject.scaleY *= -1, b.selectedObject.text ? b.selectTextObject(b.selectedObject) : b.selectObject(b.selectedObject), b.updateImageHandle(), b.stage.update());
    });
    e.addClass("entryPlaygroundPainterFlipY");
    this.flipObject.appendChild(e);
    Entry.addEventListener("windowResized", function(b) {
      var c = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      b = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      var d = parseInt(document.getElementById("entryCanvas").style.width), c = c - (d + 240), d = b - 349;
      a.style.width = c + "px";
      f.style.width = c - 54 + "px";
      f.style.height = d + "px";
      g.style.top = d + 30 + "px";
      g.style.height = b - d + "px";
    });
    var h = Entry.createElement("nav", "entryPainterTopMenu");
    h.addClass("entryPlaygroundPainterTopMenu");
    c.appendChild(h);
    e = Entry.createElement("ul");
    h.appendChild(e);
    var k = Entry.createElement("li");
    h.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuFileNew");
    h.bindOnClick(function() {
      b.newPicture();
    });
    h.addClass("entryPlaygroundPainterTopMenuFileNew");
    h.innerHTML = Lang.Workspace.new_picture;
    k.appendChild(h);
    h = Entry.createElement("li", "entryPainterTopMenuFile");
    h.addClass("entryPlaygroundPainterTopMenuFile");
    h.innerHTML = Lang.Workspace.painter_file;
    e.appendChild(h);
    k = Entry.createElement("ul");
    h.appendChild(k);
    h = Entry.createElement("li");
    k.appendChild(h);
    var m = Entry.createElement("a", "entryPainterTopMenuFileSave");
    m.bindOnClick(function() {
      b.file_save(!1);
    });
    m.addClass("entryPainterTopMenuFileSave");
    m.innerHTML = Lang.Workspace.painter_file_save;
    h.appendChild(m);
    h = Entry.createElement("li");
    k.appendChild(h);
    k = Entry.createElement("a", "entryPainterTopMenuFileSaveAs");
    k.bindOnClick(function() {
      b.file.mode = "new";
      b.file_save(!1);
    });
    k.addClass("entryPlaygroundPainterTopMenuFileSaveAs");
    k.innerHTML = Lang.Workspace.painter_file_saveas;
    h.appendChild(k);
    k = Entry.createElement("li", "entryPainterTopMenuEdit");
    k.addClass("entryPlaygroundPainterTopMenuEdit");
    k.innerHTML = Lang.Workspace.painter_edit;
    e.appendChild(k);
    e = Entry.createElement("ul");
    k.appendChild(e);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditImportLink");
    h.bindOnClick(function() {
      Entry.dispatchEvent("openPictureImport");
    });
    h.addClass("entryPainterTopMenuEditImport");
    h.innerHTML = Lang.Workspace.get_file;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditCopy");
    h.bindOnClick(function() {
      b.edit_copy();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditCopy");
    h.innerHTML = Lang.Workspace.copy_file;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditCut");
    h.bindOnClick(function() {
      b.edit_cut();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditCut");
    h.innerHTML = Lang.Workspace.cut_picture;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditPaste");
    h.bindOnClick(function() {
      b.edit_paste();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditPaste");
    h.innerHTML = Lang.Workspace.paste_picture;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    e = Entry.createElement("a", "entryPainterTopMenuEditEraseAll");
    e.addClass("entryPlaygroundPainterTopMenuEditEraseAll");
    e.innerHTML = Lang.Workspace.remove_all;
    e.bindOnClick(function() {
      b.clearCanvas();
    });
    k.appendChild(e);
    this.painterTopStageXY = e = Entry.createElement("div", "entryPainterTopStageXY");
    e.addClass("entryPlaygroundPainterTopStageXY");
    c.appendChild(e);
    e = Entry.createElement("ul", "entryPainterTopToolbar");
    e.addClass("entryPlaygroundPainterTopToolbar");
    c.appendChild(e);
    c = Entry.createElement("li", "entryPainterTopToolbarUndo");
    c.bindOnClick(function() {
    });
    c.addClass("entryPlaygroundPainterTopToolbar");
    e.appendChild(c);
    c = Entry.createElement("li", "entryPainterTopToolbarRedo");
    c.bindOnClick(function() {
    });
    c.addClass("entryPlaygroundPainterTopToolbar");
    e.appendChild(c);
    c = Entry.createElement("ul");
    c.addClass("entryPlaygroundPainterToolboxContainer");
    d.appendChild(c);
    this.toolboxCursor = Entry.createElement("li", "entryPainterToolboxCursor");
    this.toolboxCursor.title = "\uc774\ub3d9";
    this.toolboxCursor.bindOnClick(function() {
      b.selectToolbox("cursor");
    });
    this.toolboxCursor.addClass("entryPlaygroundPainterToolboxCursor");
    c.appendChild(this.toolboxCursor);
    this.toolboxSelect = Entry.createElement("li", "entryPainterToolboxSelect");
    this.toolboxSelect.title = "\uc790\ub974\uae30";
    this.toolboxSelect.bindOnClick(function() {
      b.selectToolbox("select");
    });
    this.toolboxSelect.addClass("entryPlaygroundPainterToolboxSelect");
    c.appendChild(this.toolboxSelect);
    this.toolboxPen = Entry.createElement("li", "entryPainterToolboxPen");
    this.toolboxPen.title = "\ud39c";
    this.toolboxPen.bindOnClick(function() {
      b.selectToolbox("pen");
    });
    this.toolboxPen.addClass("entryPlaygroundPainterToolboxPen");
    c.appendChild(this.toolboxPen);
    this.toolboxLine = Entry.createElement("li", "entryPainterToolboxLine");
    this.toolboxLine.title = "\uc9c1\uc120";
    this.toolboxLine.bindOnClick(function() {
      b.selectToolbox("line");
    });
    this.toolboxLine.addClass("entryPlaygroundPainterToolboxLine");
    c.appendChild(this.toolboxLine);
    this.toolboxRect = Entry.createElement("li", "entryPainterToolboxRect");
    this.toolboxRect.title = "\uc0ac\uac01\ud615";
    this.toolboxRect.bindOnClick(function() {
      b.selectToolbox("rect");
    });
    this.toolboxRect.addClass("entryPlaygroundPainterToolboxRect");
    c.appendChild(this.toolboxRect);
    this.toolboxCircle = Entry.createElement("li", "entryPainterToolboxCircle");
    this.toolboxCircle.title = "\uc6d0";
    this.toolboxCircle.bindOnClick(function() {
      b.selectToolbox("circle");
    });
    this.toolboxCircle.addClass("entryPlaygroundPainterToolboxCircle");
    c.appendChild(this.toolboxCircle);
    this.toolboxText = Entry.createElement("li", "entryPainterToolboxText");
    this.toolboxText.title = "\uae00\uc0c1\uc790";
    this.toolboxText.bindOnClick(function() {
      b.selectToolbox("text");
    });
    this.toolboxText.addClass("entryPlaygroundPainterToolboxText");
    c.appendChild(this.toolboxText);
    this.toolboxFill = Entry.createElement("li", "entryPainterToolboxFill");
    this.toolboxFill.bindOnClick(function() {
      b.selectToolbox("fill");
    });
    this.toolboxFill.addClass("entryPlaygroundPainterToolboxFill");
    c.appendChild(this.toolboxFill);
    this.toolboxErase = Entry.createElement("li", "entryPainterToolboxErase");
    this.toolboxErase.title = "\uc9c0\uc6b0\uae30";
    this.toolboxErase.bindOnClick(function() {
      b.selectToolbox("erase");
    });
    this.toolboxErase.addClass("entryPlaygroundPainterToolboxErase");
    c.appendChild(this.toolboxErase);
    d = Entry.createElement("li", "entryPainterToolboxCoordinate");
    d.title = "\uc88c\ud45c";
    d.bindOnClick(function() {
      b.toggleCoordinator();
    });
    d.addClass("entryPlaygroundPainterToolboxCoordinate");
    c.appendChild(d);
    this.attrResizeArea = Entry.createElement("fieldset", "painterAttrResize");
    this.attrResizeArea.addClass("entryPlaygroundPainterAttrResize");
    g.appendChild(this.attrResizeArea);
    d = Entry.createElement("legend");
    d.innerHTML = Lang.Workspace.picture_size;
    this.attrResizeArea.appendChild(d);
    d = Entry.createElement("div", "painterAttrWrapper");
    d.addClass("painterAttrWrapper");
    this.attrResizeArea.appendChild(d);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterAttrResizeX");
    d.appendChild(c);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrResizeXTop");
    e.innerHTML = "X";
    c.appendChild(e);
    this.objectWidthInput = Entry.createElement("input", "entryPainterAttrWidth");
    this.objectWidthInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      b.handle.width = this.value;
      b.updateImageHandle();
    };
    this.objectWidthInput.addClass("entryPlaygroundPainterNumberInput");
    c.appendChild(this.objectWidthInput);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterSizeText");
    c.innerHTML = "x";
    d.appendChild(c);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundAttrReiszeY");
    d.appendChild(c);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterAttrResizeYTop");
    d.innerHTML = "Y";
    c.appendChild(d);
    this.objectHeightInput = Entry.createElement("input", "entryPainterAttrHeight");
    this.objectHeightInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      b.handle.height = this.value;
      b.updateImageHandle();
    };
    this.objectHeightInput.addClass("entryPlaygroundPainterNumberInput");
    c.appendChild(this.objectHeightInput);
    this.attrRotateArea = Entry.createElement("div", "painterAttrRotateArea");
    this.attrRotateArea.addClass("painterAttrRotateArea");
    g.appendChild(this.attrRotateArea);
    d = Entry.createElement("div");
    d.addClass("painterAttrRotateName");
    d.innerHTML = Lang.Workspace.picture_rotation;
    this.attrRotateArea.appendChild(d);
    d = Entry.createElement("fieldset", "entryPainterAttrRotate");
    d.addClass("entryPlaygroundPainterAttrRotate");
    this.attrRotateArea.appendChild(d);
    c = Entry.createElement("div");
    c.addClass("painterAttrRotateTop");
    c.innerHTML = "\u03bf";
    d.appendChild(c);
    this.objectRotateInput = Entry.createElement("input", "entryPainterAttrDegree");
    this.objectRotateInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      360 <= this.value ? this.value %= 360 : 0 > this.value && (this.value = 360 + this.value % 360);
      b.handle.rotation = this.value;
      b.updateImageHandle();
    };
    this.objectRotateInput.addClass("entryPlaygroundPainterNumberInput");
    this.objectRotateInput.defaultValue = "0";
    d.appendChild(this.objectRotateInput);
    this.attrColorArea = Entry.createElement("fieldset", "entryPainterAttrColor");
    this.attrColorArea.addClass("entryPlaygroundPainterAttrColor");
    g.appendChild(this.attrColorArea);
    var l = Entry.createElement("div");
    l.addClass("entryPlaygroundPainterAttrColorContainer");
    this.attrColorArea.appendChild(l);
    this.attrCircleArea = Entry.createElement("div");
    this.attrCircleArea.addClass("painterAttrCircleArea");
    g.appendChild(this.attrCircleArea);
    d = Entry.createElement("div", "entryPainterAttrCircle");
    d.addClass("painterAttrCircle");
    this.attrCircleArea.appendChild(d);
    this.attrCircleArea.painterAttrCircle = d;
    d = Entry.createElement("input", "entryPainterAttrCircleInput");
    d.value = "#000000";
    d.addClass("painterAttrCircleInput");
    this.attrCircleArea.appendChild(d);
    this.attrColorSpoid = Entry.createElement("div");
    this.attrColorSpoid.bindOnClick(function() {
      b.selectToolbox("spoid");
    });
    this.attrColorSpoid.addClass("painterAttrColorSpoid");
    g.appendChild(this.attrColorSpoid);
    Entry.getColourCodes().forEach(function(a) {
      var c = Entry.createElement("div");
      c.addClass("entryPlaygroundPainterAttrColorElement");
      "transparent" === a ? c.style.backgroundImage = "url(" + (Entry.mediaFilePath + "/transparent.png") + ")" : c.style.backgroundColor = a;
      c.bindOnClick(function(c) {
        "transparent" === a ? (b.stroke.transparent = !0, b.stroke.lineColor = "#ffffff") : (b.stroke.transparent = !1, r && (document.getElementById("entryPainterShapeBackgroundColor").style.backgroundColor = a, b.stroke.fillColor = a), r || (document.getElementById("entryPainterShapeLineColor").style.backgroundColor = a, b.stroke.lineColor = a));
        document.getElementById("entryPainterAttrCircle").style.backgroundColor = b.stroke.lineColor;
        document.getElementById("entryPainterAttrCircleInput").value = a;
      });
      l.appendChild(c);
    });
    this.attrThickArea = Entry.createElement("div", "painterAttrThickArea");
    this.attrThickArea.addClass("entryPlaygroundentryPlaygroundPainterAttrThickArea");
    g.appendChild(this.attrThickArea);
    d = Entry.createElement("legend");
    d.addClass("painterAttrThickName");
    d.innerHTML = Lang.Workspace.thickness;
    this.attrThickArea.appendChild(d);
    var n = Entry.createElement("fieldset", "entryPainterAttrThick");
    n.addClass("entryPlaygroundPainterAttrThick");
    this.attrThickArea.appendChild(n);
    d = Entry.createElement("div");
    d.addClass("paintAttrThickTop");
    n.appendChild(d);
    e = Entry.createElement("select", "entryPainterAttrThick");
    e.addClass("entryPlaygroundPainterAttrThickInput");
    e.size = "1";
    e.onchange = function(a) {
      b.stroke.thickness = a.target.value;
    };
    for (d = 1;10 >= d;d++) {
      c = Entry.createElement("option"), c.value = d, c.innerHTML = d, e.appendChild(c);
    }
    n.appendChild(e);
    d = Entry.createElement("div", "entryPainterShapeLineColor");
    d.addClass("painterAttrShapeLineColor");
    c = Entry.createElement("div", "entryPainterShapeInnerBackground");
    c.addClass("painterAttrShapeInnerBackground");
    d.appendChild(c);
    n.appendChild(d);
    this.attrThickArea.painterAttrShapeLineColor = d;
    n.bindOnClick(function() {
      q.style.zIndex = "1";
      this.style.zIndex = "10";
      r = !1;
    });
    this.attrBackgroundArea = Entry.createElement("div", "painterAttrBackgroundArea");
    this.attrBackgroundArea.addClass("entryPlaygroundPainterBackgroundArea");
    g.appendChild(this.attrBackgroundArea);
    d = Entry.createElement("fieldset", "entryPainterAttrbackground");
    d.addClass("entryPlaygroundPainterAttrBackground");
    this.attrBackgroundArea.appendChild(d);
    c = Entry.createElement("div");
    c.addClass("paintAttrBackgroundTop");
    d.appendChild(c);
    var q = Entry.createElement("div", "entryPainterShapeBackgroundColor");
    q.addClass("painterAttrShapeBackgroundColor");
    this.attrBackgroundArea.painterAttrShapeBackgroundColor = q;
    c.appendChild(q);
    var r = !1;
    q.bindOnClick(function(b) {
      n.style.zIndex = "1";
      this.style.zIndex = "10";
      r = !0;
    });
    this.attrFontArea = Entry.createElement("div", "painterAttrFont");
    this.attrFontArea.addClass("entryPlaygroundPainterAttrFont");
    g.appendChild(this.attrFontArea);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrTop");
    this.attrFontArea.appendChild(e);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPaintAttrTop_");
    e.appendChild(d);
    d = Entry.createElement("legend");
    d.addClass("panterAttrFontTitle");
    d.innerHTML = Lang.Workspace.textStyle;
    k = Entry.createElement("select", "entryPainterAttrFontName");
    k.addClass("entryPlaygroundPainterAttrFontName");
    k.size = "1";
    k.onchange = function(a) {
      b.font.name = a.target.value;
    };
    for (d = 0;d < Entry.fonts.length;d++) {
      h = Entry.fonts[d], c = Entry.createElement("option"), c.value = h.family, c.innerHTML = h.name, k.appendChild(c);
    }
    e.appendChild(k);
    e = Entry.createElement("div");
    e.addClass("painterAttrFontSizeArea");
    this.attrFontArea.appendChild(e);
    d = Entry.createElement("div");
    d.addClass("painterAttrFontSizeTop");
    e.appendChild(d);
    k = Entry.createElement("select", "entryPainterAttrFontSize");
    k.addClass("entryPlaygroundPainterAttrFontSize");
    k.size = "1";
    k.onchange = function(a) {
      b.font.size = a.target.value;
    };
    for (d = 20;72 >= d;d++) {
      c = Entry.createElement("option"), c.value = d, c.innerHTML = d, k.appendChild(c);
    }
    e.appendChild(k);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrFontStyleArea");
    this.attrFontArea.appendChild(e);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterAttrFontTop");
    e.appendChild(d);
    k = Entry.createElement("select", "entryPainterAttrFontStyle");
    k.addClass("entryPlaygroundPainterAttrFontStyle");
    k.size = "1";
    k.onchange = function(a) {
      b.font.style = a.target.value;
    };
    h = [{label:"\ubcf4\ud1b5", value:"normal"}, {label:"\uad75\uac8c", value:"bold"}, {label:"\uae30\uc6b8\uc784", value:"italic"}];
    for (d = 0;d < h.length;d++) {
      m = h[d], c = Entry.createElement("option"), c.value = m.value, c.innerHTML = m.label, k.appendChild(c);
    }
    e.appendChild(k);
    this.attrLineArea = Entry.createElement("div", "painterAttrLineStyle");
    this.attrLineArea.addClass("entryPlaygroundPainterAttrLineStyle");
    g.appendChild(this.attrLineArea);
    var t = Entry.createElement("div");
    t.addClass("entryPlaygroundPainterAttrLineStyleLine");
    this.attrLineArea.appendChild(t);
    var u = Entry.createElement("div");
    u.addClass("entryPlaygroundPaitnerAttrLineArea");
    this.attrLineArea.appendChild(u);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterAttrLineStyleLine1");
    u.appendChild(d);
    d.value = "line";
    var v = Entry.createElement("div");
    v.addClass("painterAttrLineStyleBackgroundLine");
    t.bindOnClick(function(b) {
      u.removeClass("entryRemove");
    });
    u.blur = function(b) {
      this.addClass("entryRemove");
    };
    u.onmouseleave = function(b) {
      this.addClass("entryRemove");
    };
    d.bindOnClick(function(b) {
      this.attrLineArea.removeClass(t);
      this.attrLineArea.appendChild(v);
      this.attrLineArea.onchange(b);
      u.blur();
    });
    v.bindOnClick(function(b) {
      u.removeClass("entryRemove");
    });
    this.attrLineArea.onchange = function(a) {
      b.stroke.style = a.target.value;
    };
    u.blur();
  }
};
Entry.Painter.prototype.restoreHandle = function() {
  this.selectedObject && !1 === this.handle.visible && (this.handle.visible = !0, this.stage.update());
};
Entry.Painter.prototype.initDisplay = function() {
  this.stroke.enabled = !1;
  this.toolboxCursor.addClass("entryPlaygroundPainterToolboxCursor");
  this.toolboxCursor.removeClass("entryToolboxCursorClicked");
  this.toolboxSelect.addClass("entryPlaygroundPainterToolboxSelect");
  this.toolboxSelect.removeClass("entryToolboxSelectClicked");
  this.toolboxPen.addClass("entryPlaygroundPainterToolboxPen");
  this.toolboxPen.removeClass("entryToolboxPenClicked");
  this.toolboxLine.addClass("entryPlaygroundPainterToolboxLine");
  this.toolboxLine.removeClass("entryToolboxLineClicked");
  this.toolboxRect.addClass("entryPlaygroundPainterToolboxRect");
  this.toolboxRect.removeClass("entryToolboxRectClicked");
  this.toolboxCircle.addClass("entryPlaygroundPainterToolboxCircle");
  this.toolboxCircle.removeClass("entryToolBoxCircleClicked");
  this.toolboxText.addClass("entryPlaygroundPainterToolboxText");
  this.toolboxText.removeClass("entryToolBoxTextClicked");
  this.toolboxFill.addClass("entryPlaygroundPainterToolboxFill");
  this.toolboxFill.removeClass("entryToolBoxFillClicked");
  this.toolboxErase.addClass("entryPlaygroundPainterToolboxErase");
  this.toolboxErase.removeClass("entryToolBoxEraseClicked");
  this.attrColorSpoid.addClass("painterAttrColorSpoid");
  this.attrColorSpoid.removeClass("painterAttrColorSpoidClicked");
  this.attrResizeArea.addClass("entryRemove");
  this.attrRotateArea.addClass("entryRemove");
  this.attrThickArea.addClass("entryRemove");
  this.attrFontArea.addClass("entryRemove");
  this.attrLineArea.addClass("entryRemove");
  this.attrColorArea.addClass("entryRemove");
  this.attrCircleArea.addClass("entryRemove");
  this.attrColorSpoid.addClass("entryRemove");
  this.attrFontArea.addClass("entryRemove");
  this.attrBackgroundArea.addClass("entryRemove");
  this.flipObject.addClass("entryRemove");
  this.attrThickArea.painterAttrShapeLineColor.addClass("entryRemove");
  this.attrBackgroundArea.painterAttrShapeBackgroundColor.addClass("entryRemove");
  this.attrCircleArea.painterAttrCircle.addClass("entryRemove");
  this.inputField && !this.inputField._isHidden && (this.inputField.hide(), this.stage.update());
};
Entry.Painter.prototype.selectToolbox = function(a) {
  this.toolbox.selected = a;
  "erase" != a && $(".entryPlaygroundPainterContainer").removeClass("dd");
  this.initDisplay();
  "cursor" !== a && this.clearHandle();
  "text" !== a && this.inputField && delete this.inputField;
  switch(a) {
    case "cursor":
      this.restoreHandle();
      this.toolboxCursor.addClass("entryToolboxCursorClicked");
      this.attrResizeArea.removeClass("entryRemove");
      this.attrRotateArea.removeClass("entryRemove");
      this.flipObject.removeClass("entryRemove");
      break;
    case "select":
      this.toolboxSelect.addClass("entryToolboxSelectClicked");
      break;
    case "pen":
      this.toolboxPen.addClass("entryToolboxPenClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      break;
    case "line":
      this.toolboxLine.addClass("entryToolboxLineClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      break;
    case "rect":
      this.toolboxRect.addClass("entryToolboxRectClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrBackgroundArea.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      this.attrBackgroundArea.painterAttrShapeBackgroundColor.removeClass("entryRemove");
      break;
    case "circle":
      this.toolboxCircle.addClass("entryToolBoxCircleClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      this.attrBackgroundArea.removeClass("entryRemove");
      this.attrBackgroundArea.painterAttrShapeBackgroundColor.removeClass("entryRemove");
      break;
    case "text":
      this.toolboxText.addClass("entryToolBoxTextClicked");
      this.attrFontArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrCircleArea.painterAttrCircle.removeClass("entryRemove");
      break;
    case "fill":
      this.toolboxFill.addClass("entryToolBoxFillClicked");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrCircleArea.painterAttrCircle.removeClass("entryRemove");
      break;
    case "erase":
      $(".entryPlaygroundPainterContainer").addClass("dd");
      this.toolboxErase.addClass("entryToolBoxEraseClicked");
      this.attrThickArea.removeClass("entryRemove");
      break;
    case "spoid":
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("painterAttrColorSpoid");
      this.attrColorSpoid.addClass("painterAttrColorSpoidClicked");
      break;
    case "coordinate":
      this.toggleCoordinator();
  }
};
Entry.Painter2 = function(a) {
  this.view = a;
  this.baseUrl = Entry.painterBaseUrl || "/lib/literallycanvas/lib/img";
  this.file = {id:Entry.generateHash(), name:"\uc0c8\uadf8\ub9bc", modified:!1, mode:"new"};
  Entry.addEventListener("pictureImport", function(b) {
    this.addPicture(b);
  }.bind(this));
  this.clipboard = null;
};
(function(a) {
  a.initialize = function() {
    if (!this.lc) {
      var b = this.baseUrl, a = new Image;
      a.src = b + "/transparent-pattern.png";
      this.lc = LC.init(this.view, {imageURLPrefix:b, zoomMax:3, zoomMin:.5, toolbarPosition:"bottom", imageSize:{width:960, height:540}, backgroundShapes:[LC.createShape("Rectangle", {x:0, y:0, width:960, height:540, strokeWidth:0, strokeColor:"transparent"})]});
      a.onload = function() {
        this.lc.repaintLayer("background");
      }.bind(this);
      b = function(b) {
        b.shape && !b.opts && b.shape.isPass || b.opts && b.opts.isPass ? Entry.do("processPicture", b, this.lc) : Entry.do("editPicture", b, this.lc);
        this.file.modified = !0;
      }.bind(this);
      this.lc.on("clear", b);
      this.lc.on("shapeEdit", b);
      this.lc.on("shapeSave", b);
      this.lc.on("toolChange", function(b) {
        this.updateEditMenu();
      }.bind(this));
      this.lc.on("lc-pointerdrag", this.stagemousemove.bind(this));
      this.lc.on("lc-pointermove", this.stagemousemove.bind(this));
      this.initTopBar();
      this.updateEditMenu();
      Entry.keyPressed && Entry.keyPressed.attach(this, this._keyboardPressControl);
      Entry.keyUpped && Entry.keyUpped.attach(this, this._keyboardUpControl);
    }
  };
  a.show = function() {
    this.lc || this.initialize();
    this.isShow = !0;
  };
  a.hide = function() {
    this.isShow = !1;
  };
  a.changePicture = function(b) {
    this.file && this.file.id === b.id || (this.file.modified && confirm("\uc218\uc815\ub41c \ub0b4\uc6a9\uc744 \uc800\uc7a5\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?") && this.file_save(!0), this.file.modified = !1, this.lc.clear(!1), this.file.id = b.id ? b.id : Entry.generateHash(), this.file.name = b.name, this.file.mode = "edit", this.addPicture(b, !0));
  };
  a.addPicture = function(b, a) {
    var c = new Image;
    c.src = b.fileurl ? b.fileurl : Entry.defaultPath + "/uploads/" + b.filename.substring(0, 2) + "/" + b.filename.substring(2, 4) + "/image/" + b.filename + ".png";
    b = b.dimension;
    var e = LC.createShape("Image", {x:480, y:270, width:b.width, height:b.height, image:c});
    this.lc.saveShape(e, !a);
    c.onload = function() {
      this.lc.setTool(this.lc.tools.SelectShape);
      this.lc.tool.setShape(this.lc, e);
    }.bind(this);
  };
  a.copy = function() {
    if ("SelectShape" === this.lc.tool.name && this.lc.tool.selectedShape) {
      var b = this.lc.tool.selectedShape;
      this.clipboard = {className:b.className, data:b.toJSON()};
      this.updateEditMenu();
    }
  };
  a.cut = function() {
    "SelectShape" === this.lc.tool.name && this.lc.tool.selectedShape && (this.copy(), this.lc.removeShape(this.lc.tool.selectedShape), this.lc.tool.setShape(this.lc, null));
  };
  a.paste = function() {
    if (this.clipboard) {
      var b = this.lc.addShape(this.clipboard);
      this.lc.setTool(this.lc.tools.SelectShape);
      this.lc.tool.setShape(this.lc, b);
    }
  };
  a.updateEditMenu = function() {
    var b = "SelectShape" === this.lc.tool.name ? "block" : "none";
    this._cutButton.style.display = b;
    this._copyButton.style.display = b;
    this._pasteButton.style.display = this.clipboard ? "block" : "none";
  };
  a.file_save = function() {
    this.lc.trigger("dispose");
    var b = this.lc.getImage().toDataURL();
    this.file_ = JSON.parse(JSON.stringify(this.file));
    Entry.dispatchEvent("saveCanvasImage", {file:this.file_, image:b});
    this.file.modified = !1;
  };
  a.newPicture = function() {
    var b = {dimension:{height:1, width:1}, fileurl:Entry.mediaFilePath + "_1x1.png", name:Lang.Workspace.new_picture};
    b.id = Entry.generateHash();
    Entry.playground.addPicture(b, !0);
  };
  a._keyboardPressControl = function(b) {
    if (this.isShow && !Entry.Utils.isInInput(b)) {
      var a = b.keyCode || b.which, d = b.ctrlKey;
      8 == a || 46 == a ? (this.cut(), b.preventDefault()) : d && (67 == a ? this.copy() : 88 == a && this.cut());
      d && 86 == a && this.paste();
      this.lc.trigger("keyDown", b);
    }
  };
  a._keyboardUpControl = function(b) {
    this.lc.trigger("keyUp", b);
  };
  a.initTopBar = function() {
    var b = this, a = Entry.createElement(document.getElementById("canvas-top-menu"));
    a.addClass("entryPlaygroundPainterTop");
    a.addClass("entryPainterTop");
    var d = Entry.createElement("nav", "entryPainterTopMenu");
    d.addClass("entryPlaygroundPainterTopMenu");
    a.appendChild(d);
    var e = Entry.createElement("ul");
    d.appendChild(e);
    var f = Entry.createElement("li");
    d.appendChild(f);
    d = Entry.createElement("a", "entryPainterTopMenuFileNew");
    d.bindOnClick(function() {
      b.newPicture();
    });
    d.addClass("entryPlaygroundPainterTopMenuFileNew");
    d.innerHTML = Lang.Workspace.new_picture;
    f.appendChild(d);
    d = Entry.createElement("li", "entryPainterTopMenuFile");
    d.addClass("entryPlaygroundPainterTopMenuFile");
    d.innerHTML = Lang.Workspace.painter_file;
    e.appendChild(d);
    f = Entry.createElement("ul");
    d.appendChild(f);
    d = Entry.createElement("li");
    f.appendChild(d);
    var g = Entry.createElement("a", "entryPainterTopMenuFileSave");
    g.bindOnClick(function() {
      b.file_save(!1);
    });
    g.addClass("entryPainterTopMenuFileSave");
    g.innerHTML = Lang.Workspace.painter_file_save;
    d.appendChild(g);
    d = Entry.createElement("li");
    f.appendChild(d);
    f = Entry.createElement("a", "entryPainterTopMenuFileSaveAs");
    f.bindOnClick(function() {
      b.file.mode = "new";
      b.file_save(!1);
    });
    f.addClass("entryPlaygroundPainterTopMenuFileSaveAs");
    f.innerHTML = Lang.Workspace.painter_file_saveas;
    d.appendChild(f);
    f = Entry.createElement("li", "entryPainterTopMenuEdit");
    f.addClass("entryPlaygroundPainterTopMenuEdit");
    f.innerHTML = Lang.Workspace.painter_edit;
    e.appendChild(f);
    e = Entry.createElement("ul");
    f.appendChild(e);
    f = Entry.createElement("li");
    e.appendChild(f);
    d = Entry.createElement("a", "entryPainterTopMenuEditImportLink");
    d.bindOnClick(function() {
      Entry.dispatchEvent("openPictureImport");
    });
    d.addClass("entryPainterTopMenuEditImport");
    d.innerHTML = Lang.Workspace.get_file;
    f.appendChild(d);
    f = Entry.createElement("li");
    e.appendChild(f);
    d = Entry.createElement("a", "entryPainterTopMenuEditCopy");
    d.bindOnClick(function() {
      b.copy();
    });
    d.addClass("entryPlaygroundPainterTopMenuEditCopy");
    d.innerHTML = Lang.Workspace.copy_file;
    f.appendChild(d);
    this._copyButton = f;
    f = Entry.createElement("li");
    e.appendChild(f);
    d = Entry.createElement("a", "entryPainterTopMenuEditCut");
    d.bindOnClick(function() {
      b.cut();
    });
    d.addClass("entryPlaygroundPainterTopMenuEditCut");
    d.innerHTML = Lang.Workspace.cut_picture;
    f.appendChild(d);
    this._cutButton = f;
    f = Entry.createElement("li");
    e.appendChild(f);
    d = Entry.createElement("a", "entryPainterTopMenuEditPaste");
    d.bindOnClick(function() {
      b.paste();
    });
    d.addClass("entryPlaygroundPainterTopMenuEditPaste");
    d.innerHTML = Lang.Workspace.paste_picture;
    f.appendChild(d);
    this._pasteButton = f;
    f = Entry.createElement("li");
    e.appendChild(f);
    e = Entry.createElement("a", "entryPainterTopMenuEditEraseAll");
    e.addClass("entryPlaygroundPainterTopMenuEditEraseAll");
    e.innerHTML = Lang.Workspace.remove_all;
    e.bindOnClick(function() {
      b.lc.clear();
    });
    f.appendChild(e);
    this.painterTopStageXY = e = Entry.createElement("div", "entryPainterTopStageXY");
    e.addClass("entryPlaygroundPainterTopStageXY");
    a.appendChild(e);
    Entry.addEventListener("pictureSelected", this.changePicture.bind(this));
  };
  a.stagemousemove = function(b) {
    this.painterTopStageXY.textContent = "x:" + b.x.toFixed(1) + ", y:" + b.y.toFixed(1);
  };
})(Entry.Painter2.prototype);
Entry.BlockParser = function(a) {
  this.syntax = a;
  this._iterVariableCount = 0;
  this._iterVariableChunk = ["i", "j", "k"];
};
(function(a) {
  a.Code = function(b) {
    if (b instanceof Entry.Thread) {
      return this.Thread(b);
    }
    if (b instanceof Entry.Block) {
      return this.Block(b);
    }
    var a = "";
    b = b.getThreads();
    for (var d = 0;d < b.length;d++) {
      a += this.Thread(b[d]);
    }
    return a;
  };
  a.Thread = function(b) {
    if (b instanceof Entry.Block) {
      return this.Block(b);
    }
    var a = "";
    b = b.getBlocks();
    for (var d = 0;d < b.length;d++) {
      a += this.Block(b[d]);
    }
    return a;
  };
  a.Block = function(b) {
    var a = b._schema.syntax;
    return a ? this[a[0]](b) : "";
  };
  a.Program = function(b) {
    return "";
  };
  a.Scope = function(b) {
    b = b._schema.syntax.concat();
    return b.splice(1, b.length - 1).join(".") + "();\n";
  };
  a.BasicFunction = function(b) {
    b = this.Thread(b.statements[0]);
    return "function promise() {\n" + this.indent(b) + "}\n";
  };
  a.BasicIteration = function(b) {
    var a = b.params[0], d = this.publishIterateVariable();
    b = this.Thread(b.statements[0]);
    this.unpublishIterateVariable();
    return "for (var " + d + " = 0; " + d + " < " + a + "; " + d + "++){\n" + this.indent(b) + "}\n";
  };
  a.BasicIf = function(b) {
    var a = this.Thread(b.statements[0]);
    return "if (" + b._schema.syntax.concat()[1] + ") {\n" + this.indent(a) + "}\n";
  };
  a.BasicWhile = function(b) {
    var a = this.Thread(b.statements[0]);
    return "while (" + b._schema.syntax.concat()[1] + ") {\n" + this.indent(a) + "}\n";
  };
  a.indent = function(b) {
    var a = "    ";
    b = b.split("\n");
    b.pop();
    return a += b.join("\n    ") + "\n";
  };
  a.publishIterateVariable = function() {
    var b = "", a = this._iterVariableCount;
    do {
      b = this._iterVariableChunk[a % 3] + b, a = parseInt(a / 3) - 1, 0 === a && (b = this._iterVariableChunk[0] + b);
    } while (0 < a);
    this._iterVariableCount++;
    return b;
  };
  a.unpublishIterateVariable = function() {
    this._iterVariableCount && this._iterVariableCount--;
  };
})(Entry.BlockParser.prototype);
Entry.JSParser = function(a) {
  this.syntax = a;
  this.scopeChain = [];
  this.scope = null;
};
(function(a) {
  a.Program = function(b) {
    var a = [], d = [];
    d.push({type:this.syntax.Program});
    var e = this.initScope(b), d = d.concat(this.BlockStatement(b));
    this.unloadScope();
    a.push(d);
    return a = a.concat(e);
  };
  a.Identifier = function(b, a) {
    return a ? a[b.name] : this.scope[b.name];
  };
  a.ExpressionStatement = function(b) {
    b = b.expression;
    return this[b.type](b);
  };
  a.ForStatement = function(b) {
    var a = b.init, d = b.test, e = b.update, f = b.body;
    if (this.syntax.ForStatement) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
    }
    var f = this[f.type](f), a = a.declarations[0].init.value, g = d.operator, d = d.right.value, h = 0;
    "++" != e.operator && (e = a, a = d, d = e);
    switch(g) {
      case "<":
        h = d - a;
        break;
      case "<=":
        h = d + 1 - a;
        break;
      case ">":
        h = a - d;
        break;
      case ">=":
        h = a + 1 - d;
    }
    return this.BasicIteration(b, h, f);
  };
  a.BlockStatement = function(b) {
    var a = [];
    b = b.body;
    for (var d = 0;d < b.length;d++) {
      var e = b[d], f = this[e.type](e);
      if (f) {
        if (void 0 === f.type) {
          throw {message:"\ud574\ub2f9\ud558\ub294 \ube14\ub85d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.", node:e};
        }
        f && a.push(f);
      }
    }
    return a;
  };
  a.EmptyStatement = function(b) {
    throw {message:"empty\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.DebuggerStatement = function(b) {
    throw {message:"debugger\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.WithStatement = function(b) {
    throw {message:"with\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ReturnStaement = function(b) {
    throw {message:"return\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.LabeledStatement = function(b) {
    throw {message:"label\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.BreakStatement = function(b) {
    throw {message:"break\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ContinueStatement = function(b) {
    throw {message:"continue\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.IfStatement = function(b) {
    if (this.syntax.IfStatement) {
      throw {message:"if\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
    }
    return this.BasicIf(b);
  };
  a.SwitchStatement = function(b) {
    throw {message:"switch\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.SwitchCase = function(b) {
    throw {message:"switch ~ case\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ThrowStatement = function(b) {
    throw {message:"throw\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.TryStatement = function(b) {
    throw {message:"try\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.CatchClause = function(b) {
    throw {message:"catch\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.WhileStatement = function(b) {
    var a = b.body, d = this.syntax.WhileStatement, a = this[a.type](a);
    if (d) {
      throw {message:"while\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
    }
    return this.BasicWhile(b, a);
  };
  a.DoWhileStatement = function(b) {
    throw {message:"do ~ while\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ForInStatement = function(b) {
    throw {message:"for ~ in\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.FunctionDeclaration = function(b) {
    if (this.syntax.FunctionDeclaration) {
      throw {message:"function\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
    }
    return null;
  };
  a.VariableDeclaration = function(b) {
    throw {message:"var\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ThisExpression = function(b) {
    return this.scope.this;
  };
  a.ArrayExpression = function(b) {
    throw {message:"array\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ObjectExpression = function(b) {
    throw {message:"object\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.Property = function(b) {
    throw {message:"init, get, set\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.FunctionExpression = function(b) {
    throw {message:"function\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.UnaryExpression = function(b) {
    throw {message:b.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:b};
  };
  a.UnaryOperator = function() {
    return "- + ! ~ typeof void delete".split(" ");
  };
  a.updateOperator = function() {
    return ["++", "--"];
  };
  a.BinaryOperator = function() {
    return "== != === !== < <= > >= << >> >>> + - * / % , ^ & in instanceof".split(" ");
  };
  a.AssignmentExpression = function(b) {
    throw {message:b.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:b};
  };
  a.AssignmentOperator = function() {
    return "= += -= *= /= %= <<= >>= >>>= ,= ^= &=".split(" ");
  };
  a.LogicalExpression = function(b) {
    throw {message:b.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:b};
  };
  a.LogicalOperator = function() {
    return ["||", "&&"];
  };
  a.MemberExpression = function(b) {
    var a = b.object, d = b.property;
    console.log(a.type);
    a = this[a.type](a);
    console.log(a);
    d = this[d.type](d, a);
    if (Object(a) !== a || Object.getPrototypeOf(a) !== Object.prototype) {
      throw {message:a + "\uc740(\ub294) \uc798\ubabb\ub41c \uba64\ubc84 \ubcc0\uc218\uc785\ub2c8\ub2e4.", node:b};
    }
    a = d;
    if (!a) {
      throw {message:d + "\uc774(\uac00) \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.", node:b};
    }
    return a;
  };
  a.ConditionalExpression = function(b) {
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.UpdateExpression = function(b) {
    throw {message:b.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub801\uc5b4 \uc785\ub2c8\ub2e4.", node:b};
  };
  a.CallExpression = function(b) {
    b = b.callee;
    return {type:this[b.type](b)};
  };
  a.NewExpression = function(b) {
    throw {message:"new\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.SequenceExpression = function(b) {
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.initScope = function(b) {
    if (null === this.scope) {
      var a = function() {
      };
      a.prototype = this.syntax.Scope;
    } else {
      a = function() {
      }, a.prototype = this.scope;
    }
    this.scope = new a;
    this.scopeChain.push(this.scope);
    return this.scanDefinition(b);
  };
  a.unloadScope = function() {
    this.scopeChain.pop();
    this.scope = this.scopeChain.length ? this.scopeChain[this.scopeChain.length - 1] : null;
  };
  a.scanDefinition = function(b) {
    b = b.body;
    for (var a = [], d = 0;d < b.length;d++) {
      var e = b[d];
      "FunctionDeclaration" === e.type && (this.scope[e.id.name] = this.scope.promise, this.syntax.BasicFunction && (e = e.body, a.push([{type:this.syntax.BasicFunction, statements:[this[e.type](e)]}])));
    }
    return a;
  };
  a.BasicFunction = function(b, a) {
    return null;
  };
  a.BasicIteration = function(b, a, d) {
    var c = this.syntax.BasicIteration;
    if (!c) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
    }
    return {params:[a], type:c, statements:[d]};
  };
  a.BasicWhile = function(b, a) {
    var c = b.test.raw;
    if (this.syntax.BasicWhile[c]) {
      return {type:this.syntax.BasicWhile[c], statements:[a]};
    }
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b.test};
  };
  a.BasicIf = function(b) {
    var a = b.consequent, a = this[a.type](a);
    try {
      var d = "", e = "===" === b.test.operator ? "==" : b.test.operator;
      if ("Identifier" === b.test.left.type && "Literal" === b.test.right.type) {
        d = b.test.left.name + " " + e + " " + b.test.right.raw;
      } else {
        if ("Literal" === b.test.left.type && "Identifier" === b.test.right.type) {
          d = b.test.right.name + " " + e + " " + b.test.left.raw;
        } else {
          throw Error();
        }
      }
      if (this.syntax.BasicIf[d]) {
        return Array.isArray(a) || "object" !== typeof a || (a = [a]), {type:this.syntax.BasicIf[d], statements:[a]};
      }
      throw Error();
    } catch (f) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b.test};
    }
  };
})(Entry.JSParser.prototype);
Entry.ParserOld = {};
Entry.Parser = function(a, b, c) {
  this._mode = a;
  this.syntax = {};
  this.codeMirror = c;
  this._lang = b || "js";
  this.availableCode = [];
  "maze" === a && (this._stageId = Number(Ntry.configManager.getConfig("stageId")), "object" == typeof NtryData && this.setAvailableCode(NtryData.config[this._stageId].availableCode, NtryData.player[this._stageId].code));
  this.mappingSyntax(a);
  switch(this._lang) {
    case "js":
      this._parser = new Entry.JSParser(this.syntax);
      b = this.syntax;
      var d = {}, e;
      for (e in b.Scope) {
        d[e + "();\n"] = b.Scope[e];
      }
      "BasicIf" in b && (d.front = "BasicIf");
      CodeMirror.commands.javascriptComplete = function(b) {
        CodeMirror.showHint(b, null, {globalScope:d});
      };
      c.on("keyup", function(b, a) {
        !b.state.completionActive && 65 <= a.keyCode && 95 >= a.keyCode && CodeMirror.showHint(b, null, {completeSingle:!1, globalScope:d});
      });
      break;
    case "block":
      this._parser = new Entry.BlockParser(this.syntax);
  }
};
(function(a) {
  a.parse = function(b) {
    var a = null;
    switch(this._lang) {
      case "js":
        try {
          var d = acorn.parse(b), a = this._parser.Program(d);
        } catch (e) {
          this.codeMirror && (e instanceof SyntaxError ? (b = {from:{line:e.loc.line - 1, ch:e.loc.column - 2}, to:{line:e.loc.line - 1, ch:e.loc.column + 1}}, e.message = "\ubb38\ubc95 \uc624\ub958\uc785\ub2c8\ub2e4.") : (b = this.getLineNumber(e.node.start, e.node.end), b.message = e.message, b.severity = "error", this.codeMirror.markText(b.from, b.to, {className:"CodeMirror-lint-mark-error", __annotation:b, clearOnEnter:!0})), Entry.toast.alert("Error", e.message)), a = [];
        }
        break;
      case "block":
        b = this._parser.Code(b).match(/(.*{.*[\S|\s]+?}|.+)/g), a = Array.isArray(b) ? b.reduce(function(b, a, c) {
          1 === c && (b += "\n");
          return (-1 < a.indexOf("function") ? a + b : b + a) + "\n";
        }) : "";
    }
    return a;
  };
  a.getLineNumber = function(b, a) {
    var c = this.codeMirror.getValue(), e = {from:{}, to:{}};
    b = c.substring(0, b).split(/\n/gi);
    e.from.line = b.length - 1;
    e.from.ch = b[b.length - 1].length;
    a = c.substring(0, a).split(/\n/gi);
    e.to.line = a.length - 1;
    e.to.ch = a[a.length - 1].length;
    return e;
  };
  a.mappingSyntax = function(b) {
    for (var a = Object.keys(Entry.block), d = 0;d < a.length;d++) {
      var e = a[d], f = Entry.block[e];
      if (f.mode === b && -1 < this.availableCode.indexOf(e) && (f = f.syntax)) {
        for (var g = this.syntax, h = 0;h < f.length;h++) {
          var k = f[h];
          if (h === f.length - 2 && "function" === typeof f[h + 1]) {
            g[k] = f[h + 1];
            break;
          }
          g[k] || (g[k] = {});
          h === f.length - 1 ? g[k] = e : g = g[k];
        }
      }
    }
  };
  a.setAvailableCode = function(b, a) {
    var c = [];
    b.forEach(function(b, a) {
      b.forEach(function(b, a) {
        c.push(b.type);
      });
    });
    a instanceof Entry.Code ? a.getBlockList().forEach(function(b) {
      b.type !== NtryData.START && -1 === c.indexOf(b.type) && c.push(b.type);
    }) : a.forEach(function(b, a) {
      b.forEach(function(b, a) {
        b.type !== NtryData.START && -1 === c.indexOf(b.type) && c.push(b.type);
      });
    });
    this.availableCode = this.availableCode.concat(c);
  };
})(Entry.Parser.prototype);
Entry.Pdf = function(a) {
  this.generateView(a);
};
p = Entry.Pdf.prototype;
p.generateView = function(a) {
  var b = Entry.createElement("div", "entryPdfWorkspace");
  b.addClass("entryRemove");
  this._view = b;
  var c = "/pdfjs/web/viewer.html";
  a && "" != a && (c += "?file=" + a);
  pdfViewIframe = Entry.createElement("iframe", "entryPdfIframeWorkspace");
  pdfViewIframe.setAttribute("id", "pdfViewIframe");
  pdfViewIframe.setAttribute("frameborder", 0);
  pdfViewIframe.setAttribute("src", c);
  b.appendChild(pdfViewIframe);
};
p.getView = function() {
  return this._view;
};
p.resize = function() {
  var a = document.getElementById("entryContainerWorkspaceId"), b = document.getElementById("pdfViewIframe");
  w = a.offsetWidth;
  b.width = w + "px";
  b.height = 9 * w / 16 + "px";
};
Entry.FieldTrashcan = function(a) {
  a && this.setBoard(a);
  this.dragBlockObserver = this.dragBlock = null;
  this.isOver = !1;
  Entry.windowResized && Entry.windowResized.attach(this, this.setPosition);
};
(function(a) {
  a._generateView = function() {
    this.svgGroup = this.board.svg.elem("g");
    this.renderStart();
    this._addControl();
  };
  a.renderStart = function() {
    var b = Entry.mediaFilePath + "delete_";
    this.trashcanTop = this.svgGroup.elem("image", {href:b + "cover.png", width:60, height:20});
    this.svgGroup.elem("image", {href:b + "body.png", y:20, width:60, height:60});
  };
  a._addControl = function() {
    $(this.svgGroup).bind("mousedown", function(b) {
      Entry.Utils.isRightButton(b) && (b.stopPropagation(), $("#entryWorkspaceBoard").css("background", "white"));
    });
  };
  a.updateDragBlock = function() {
    var b = this.board.dragBlock, a = this.dragBlockObserver;
    a && (a.destroy(), this.dragBlockObserver = null);
    b ? this.dragBlockObserver = b.observe(this, "checkBlock", ["x", "y"]) : (this.isOver && this.dragBlock && !this.dragBlock.block.getPrevBlock() && (this.dragBlock.block.doDestroyBelow(!0), createjs.Sound.play("entryDelete")), this.tAnimation(!1));
    this.dragBlock = b;
  };
  a.checkBlock = function() {
    var b = this.dragBlock;
    if (b && b.block.isDeletable()) {
      var a = this.board.offset(), d = this.getPosition(), e = d.x + a.left, a = d.y + a.top, f, g;
      if (b = b.dragInstance) {
        f = b.offsetX, g = b.offsetY;
      }
      this.tAnimation(f >= e && g >= a);
    }
  };
  a.align = function() {
    var b = this.getPosition();
    this.svgGroup.attr({transform:"translate(" + b.x + "," + b.y + ")"});
  };
  a.setPosition = function() {
    if (this.board) {
      var b = this.board.svgDom;
      this._x = b.width() - 110;
      this._y = b.height() - 110;
      this.align();
    }
  };
  a.getPosition = function() {
    return {x:this._x, y:this._y};
  };
  a.tAnimation = function(b) {
    if (b !== this.isOver) {
      b = void 0 === b ? !0 : b;
      var a, d = this.trashcanTop;
      a = b ? {translateX:15, translateY:-25, rotateZ:30} : {translateX:0, translateY:0, rotateZ:0};
      $(d).velocity(a, {duration:50});
      this.isOver = b;
    }
  };
  a.setBoard = function(b) {
    this._dragBlockObserver && this._dragBlockObserver.destroy();
    this.board = b;
    this.svgGroup || this._generateView();
    var a = b.svg, d = a.firstChild;
    d ? a.insertBefore(this.svgGroup, d) : a.appendChild(this.svgGroup);
    this._dragBlockObserver = b.observe(this, "updateDragBlock", ["dragBlock"]);
    this.svgGroup.attr({filter:"url(#entryTrashcanFilter_" + b.suffix + ")"});
    this.setPosition();
  };
})(Entry.FieldTrashcan.prototype);
Entry.Workspace = function(a) {
  Entry.Model(this, !1);
  this.observe(this, "_handleChangeBoard", ["selectedBoard"], !1);
  this.trashcan = new Entry.FieldTrashcan;
  var b = a.blockMenu;
  b && (this.blockMenu = new Entry.BlockMenu(b.dom, b.align, b.categoryData, b.scroll), this.blockMenu.workspace = this, this.blockMenu.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1));
  if (b = a.board) {
    b.workspace = this, this.board = new Entry.Board(b), this.board.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1), this.set({selectedBoard:this.board});
  }
  if (b = a.vimBoard) {
    this.vimBoard = new Entry.Vim(b.dom), this.vimBoard.workspace = this;
  }
  this.board && this.vimBoard && this.vimBoard.hide();
  Entry.GlobalSvg.createDom();
  this.mode = Entry.Workspace.MODE_BOARD;
  Entry.keyPressed && Entry.keyPressed.attach(this, this._keyboardControl);
  this.changeEvent = new Entry.Event(this);
  Entry.commander.setCurrentEditor("board", this.board);
  this.textType = void 0 !== a.textType ? a.textType : Entry.Vim.TEXT_TYPE_PY;
};
Entry.Workspace.MODE_BOARD = 0;
Entry.Workspace.MODE_VIMBOARD = 1;
Entry.Workspace.MODE_OVERLAYBOARD = 2;
(function(a) {
  a.schema = {selectedBlockView:null, selectedBoard:null};
  a.getBoard = function() {
    return this.board;
  };
  a.getSelectedBoard = function() {
    return this.selectedBoard;
  };
  a.getBlockMenu = function() {
    return this.blockMenu;
  };
  a.getVimBoard = function() {
    return this.vimBoard;
  };
  a.getMode = function() {
    return this.mode;
  };
  a.setMode = function(b, a) {
    isNaN(b) ? (this.mode = b.boardType, this.runType = b.runType, this.textType = b.textType) : this.mode = b;
    this.mode = Number(this.mode);
    switch(this.mode) {
      case this.oldMode:
        return;
      case Entry.Workspace.MODE_VIMBOARD:
        try {
          this.board && this.board.hide(), this.overlayBoard && this.overlayBoard.hide(), this.set({selectedBoard:this.vimBoard}), this.vimBoard.show(), this.codeToText(this.board.code, b), this.blockMenu.renderText(function() {
            this.blockMenu.reDraw();
          }.bind(this)), this.board.clear(), this.oldTextType = this.textType;
        } catch (d) {
        }
        break;
      case Entry.Workspace.MODE_BOARD:
        try {
          this.board.show(), this.set({selectedBoard:this.board}), this.vimBoard && (this.textToCode(this.oldMode, this.oldTextType), this.vimBoard.hide()), this.overlayBoard && this.overlayBoard.hide(), this.oldMode === Entry.Workspace.MODE_VIMBOARD && this.blockMenu.renderBlock(function() {
            this.blockMenu.reDraw();
          }.bind(this)), this.oldTextType = this.textType;
        } catch (d) {
          this.board && this.board.hide(), this.set({selectedBoard:this.vimBoard}), this.mode = Entry.Workspace.MODE_VIMBOARD, this.oldTextType == Entry.Vim.PARSER_TYPE_JS_TO_BLOCK ? (b.boardType = Entry.Workspace.MODE_VIMBOARD, b.textType = Entry.Vim.TEXT_TYPE_JS, b.runType = Entry.Vim.MAZE_MODE, this.oldTextType = Entry.Vim.PARSER_TYPE_JS_TO_BLOCK, Entry.dispatchEvent("changeMode", b), Ntry.dispatchEvent("textError", b)) : this.oldTextType == Entry.Vim.PARSER_TYPE_PY_TO_BLOCK && (b.boardType = 
          Entry.Workspace.MODE_VIMBOARD, b.textType = Entry.Vim.TEXT_TYPE_PY, b.runType = Entry.Vim.WORKSPACE_MODE, this.oldTextType = Entry.Vim.PARSER_TYPE_PY_TO_BLOCK, Entry.dispatchEvent("changeMode", b));
        }
        Entry.commander.setCurrentEditor("board", this.board);
        break;
      case Entry.Workspace.MODE_OVERLAYBOARD:
        this.overlayBoard || this.initOverlayBoard(), this.overlayBoard.show(), this.set({selectedBoard:this.overlayBoard}), Entry.commander.setCurrentEditor("board", this.overlayBoard);
    }
    this.oldMode = this.mode;
    this.changeEvent.notify(a);
  };
  a.changeBoardCode = function(b) {
    this._syncTextCode();
    this.board.changeCode(b);
    this.mode === Entry.Workspace.MODE_VIMBOARD && this.codeToText(this.board.code);
  };
  a.changeOverlayBoardCode = function(b) {
    this.overlayBoard && this.overlayBoard.changeCode(b);
  };
  a.changeBlockMenuCode = function(b) {
    this.blockMenu.changeCode(b);
  };
  a.textToCode = function(b, a) {
    if (b == Entry.Workspace.MODE_VIMBOARD) {
      var c = this;
      b = this.vimBoard.textToCode(a);
      a = this.board;
      var e = a.code;
      e.load(b);
      e.createView(a);
      this.board.reDraw();
      setTimeout(function() {
        c.board.alignThreads();
      }, 0);
    }
  };
  a.codeToText = function(b, a) {
    if (this.vimBoard) {
      return this.vimBoard.codeToText(b, a);
    }
  };
  a.getCodeToText = function(b) {
    if (this.vimBoard) {
      return this.vimBoard.getCodeToText(b);
    }
  };
  a._setSelectedBlockView = function() {
    this.set({selectedBlockView:this.board.selectedBlockView || this.blockMenu.selectedBlockView || (this.overlayBoard ? this.overlayBoard.selectedBlockView : null)});
  };
  a.initOverlayBoard = function() {
    this.overlayBoard = new Entry.Board({dom:this.board.view, workspace:this, isOverlay:!0});
    this.overlayBoard.changeCode(new Entry.Code([]));
    this.overlayBoard.workspace = this;
    this.overlayBoard.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1);
  };
  a._keyboardControl = function(b) {
    var a = b.keyCode || b.which, d = b.ctrlKey;
    if (!Entry.Utils.isInInput(b)) {
      var e = this.selectedBlockView;
      e && !e.isInBlockMenu && e.block.isDeletable() && (8 == a || 46 == a ? (Entry.do("destroyBlock", e.block), b.preventDefault()) : d && (67 == a ? e.block.copyToClipboard() : 88 == a && (b = e.block, b.copyToClipboard(), b.destroy(!0, !0), e.getBoard().setSelectedBlock(null))));
      d && 86 == a && (a = this.selectedBoard) && a instanceof Entry.Board && Entry.clipboard && Entry.do("addThread", Entry.clipboard).value.getFirstBlock().copyToClipboard();
    }
  };
  a._handleChangeBoard = function() {
    var b = this.selectedBoard;
    b && b.constructor === Entry.Board && this.trashcan.setBoard(b);
  };
  a._syncTextCode = function() {
    if (this.mode === Entry.Workspace.MODE_VIMBOARD) {
      var b = this.vimBoard.textToCode(this.textType), a = this.board, d = a.code;
      d.load(b);
      d.createView(a);
      this.board.alignThreads();
    }
  };
  a.addVimBoard = function(b) {
    this.vimBoard || (this.vimBoard = new Entry.Vim(b), this.vimBoard.workspace = this, this.vimBoard.hide());
  };
})(Entry.Workspace.prototype);
Entry.BlockDriver = function() {
};
(function(a) {
  a.convert = function() {
    var b = new Date, a;
    for (a in Entry.block) {
      "function" === typeof Entry.block[a] && this._convertBlock(a);
    }
    console.log((new Date).getTime() - b.getTime());
  };
  a._convertBlock = function(b) {
    function a(b) {
      var c = {type:b.getAttribute("type"), index:{}};
      b = $(b).children();
      if (!b) {
        return c;
      }
      for (var d = 0;d < b.length;d++) {
        var e = b[d], f = e.tagName, g = $(e).children()[0], h = e.getAttribute("name");
        "value" === f ? "block" == g.nodeName && (c.params || (c.params = []), c.params.push(a(g)), c.index[h] = c.params.length - 1) : "field" === f && (c.params || (c.params = []), c.params.push(e.textContent), c.index[h] = c.params.length - 1);
      }
      return c;
    }
    var d = Blockly.Blocks[b], e = EntryStatic.blockInfo[b], f, g;
    if (e && (f = e.class, g = e.isNotFor, e = e.xml)) {
      var e = $.parseXML(e), h = a(e.childNodes[0]);
    }
    d = (new Entry.BlockMockup(d, h, b)).toJSON();
    d.class = f;
    d.isNotFor = g;
    _.isEmpty(d.paramsKeyMap) && delete d.paramsKeyMap;
    _.isEmpty(d.statementsKeyMap) && delete d.statementsKeyMap;
    d.func = Entry.block[b];
    -1 < "NUMBER TRUE FALSE TEXT FUNCTION_PARAM_BOOLEAN FUNCTION_PARAM_STRING TRUE_UN".split(" ").indexOf(b.toUpperCase()) && (d.isPrimitive = !0);
    Entry.block[b] = d;
  };
})(Entry.BlockDriver.prototype);
Entry.BlockMockup = function(a, b, c) {
  this.templates = [];
  this.params = [];
  this.statements = [];
  this.color = "";
  this.output = this.isNext = this.isPrev = !1;
  this.fieldCount = 0;
  this.events = {};
  this.def = b || {};
  this.paramsKeyMap = {};
  this.statementsKeyMap = {};
  this.definition = {params:[], type:this.def.type};
  this.simulate(a);
  this.def = this.definition;
};
(function(a) {
  a.simulate = function(b) {
    b.sensorList && (this.sensorList = b.sensorList);
    b.portList && (this.portList = b.portList);
    b.init.call(this);
    b.whenAdd && (this.events.blockViewAdd || (this.events.blockViewAdd = []), this.events.blockViewAdd.push(b.whenAdd));
    b.whenRemove && (this.events.blockViewDestroy || (this.events.blockViewDestroy = []), this.events.blockViewDestroy.push(b.whenRemove));
  };
  a.toJSON = function() {
    function b(a) {
      if (a && (a = a.params)) {
        for (var c = 0;c < a.length;c++) {
          var d = a[c];
          d && (delete d.index, b(d));
        }
      }
    }
    var a = "";
    this.output ? a = "Boolean" === this.output ? "basic_boolean_field" : "basic_string_field" : !this.isPrev && this.isNext ? a = "basic_event" : 1 == this.statements.length ? a = "basic_loop" : 2 == this.statements.length ? a = "basic_double_loop" : this.isPrev && this.isNext ? a = "basic" : this.isPrev && !this.isNext && (a = "basic_without_next");
    b(this.def);
    var d = /dummy_/mi, e;
    for (e in this.paramsKeyMap) {
      d.test(e) && delete this.paramsKeyMap[e];
    }
    for (e in this.statementsKeyMap) {
      d.test(e) && delete this.statementsKeyMap[e];
    }
    return {color:this.color, skeleton:a, statements:this.statements, template:this.templates.filter(function(b) {
      return "string" === typeof b;
    }).join(" "), params:this.params, events:this.events, def:this.def, paramsKeyMap:this.paramsKeyMap, statementsKeyMap:this.statementsKeyMap};
  };
  a.appendDummyInput = function() {
    return this;
  };
  a.appendValueInput = function(b) {
    this.def && this.def.index && (void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(null));
    this.params.push({type:"Block", accept:"string"});
    this._addToParamsKeyMap(b);
    this.templates.push(this.getFieldCount());
    return this;
  };
  a.appendStatementInput = function(b) {
    this._addToStatementsKeyMap(b);
    this.statements.push({accept:"basic"});
  };
  a.setCheck = function(b) {
    var a = this.params;
    "Boolean" === b && (a[a.length - 1].accept = "boolean");
  };
  a.appendField = function(b, a) {
    if (!b) {
      return this;
    }
    "string" === typeof b && 0 < b.length ? a ? (b = {type:"Text", text:b, color:a}, this.params.push(b), this._addToParamsKeyMap(), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[a] ? this.definition.params.push(this.def.params[this.def.index[a]]) : this.definition.params.push(void 0)) : this.templates.push(b) : b.constructor == Blockly.FieldIcon ? ("start" === b.type ? this.params.push({type:"Indicator", img:b.src_, size:17, position:{x:0, y:-2}}) : 
    this.params.push({type:"Indicator", img:b.src_, size:12}), this._addToParamsKeyMap(), this.templates.push(this.getFieldCount()), this.definition && this.definition.params.push(null)) : b.constructor == Blockly.FieldDropdown ? (this.params.push({type:"Dropdown", options:b.menuGenerator_, value:b.menuGenerator_[0][1], fontSize:11}), this._addToParamsKeyMap(a), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[a] ? this.definition.params.push(this.def.params[this.def.index[a]]) : 
    this.definition.params.push(void 0)) : b.constructor == Blockly.FieldDropdownDynamic ? (this.params.push({type:"DropdownDynamic", value:null, menuName:b.menuName_, fontSize:11}), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[a] ? this.definition.params.push(this.def.params[this.def.index[a]]) : this.definition.params.push(void 0), this._addToParamsKeyMap(a)) : b.constructor == Blockly.FieldTextInput ? (this.params.push({type:"TextInput", value:10}), 
    this.templates.push(this.getFieldCount()), this._addToParamsKeyMap(a)) : b.constructor == Blockly.FieldAngle ? (this.params.push({type:"Angle"}), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[a] ? this.definition.params.push(this.def.params[this.def.index[a]]) : this.definition.params.push(null), this._addToParamsKeyMap(a)) : b.constructor == Blockly.FieldKeydownInput ? (this.params.push({type:"Keyboard", value:81}), this.templates.push(this.getFieldCount()), 
    void 0 !== this.def.index[a] ? this.definition.params.push(this.def.params[this.def.index[a]]) : this.definition.params.push(void 0), this._addToParamsKeyMap(a)) : b.constructor == Blockly.FieldColour ? (this.params.push({type:"Color"}), this.templates.push(this.getFieldCount()), this._addToParamsKeyMap(a)) : console.log("else", b);
    return this;
  };
  a.setColour = function(b) {
    this.color = b;
  };
  a.setInputsInline = function() {
  };
  a.setOutput = function(b, a) {
    b && (this.output = a);
  };
  a.setPreviousStatement = function(b) {
    this.isPrev = b;
  };
  a.setNextStatement = function(b) {
    this.isNext = b;
  };
  a.setEditable = function(b) {
  };
  a.getFieldCount = function() {
    this.fieldCount++;
    return "%" + this.fieldCount;
  };
  a._addToParamsKeyMap = function(b) {
    b = b ? b : "dummy_" + Entry.Utils.generateId();
    var a = this.paramsKeyMap;
    a[b] = Object.keys(a).length;
  };
  a._addToStatementsKeyMap = function(b) {
    b = b ? b : "dummy_" + Entry.Utils.generateId();
    var a = this.statementsKeyMap;
    a[b] = Object.keys(a).length;
  };
})(Entry.BlockMockup.prototype);
Entry.Playground = function() {
  this.enableArduino = this.isTextBGMode_ = !1;
  this.viewMode_ = "default";
  var a = this;
  Entry.addEventListener("textEdited", this.injectText);
  Entry.addEventListener("hwChanged", this.updateHW);
  Entry.addEventListener("changeMode", function(b) {
    a.setMode(b);
  });
};
Entry.Playground.prototype.setMode = function(a) {
  this.mainWorkspace.setMode(a);
};
Entry.Playground.prototype.generateView = function(a, b) {
  this.view_ = a;
  this.view_.addClass("entryPlayground");
  b && "workspace" != b ? "phone" == b && (this.view_.addClass("entryPlaygroundPhone"), a = Entry.createElement("div", "entryCategoryTab"), a.addClass("entryPlaygroundTabPhone"), Entry.view_.insertBefore(a, this.view_), this.generateTabView(a), this.tabView_ = a, a = Entry.createElement("div", "entryCurtain"), a.addClass("entryPlaygroundCurtainPhone"), a.addClass("entryRemove"), a.innerHTML = Lang.Workspace.cannot_edit_click_to_stop, a.bindOnClick(function() {
    Entry.engine.toggleStop();
  }), this.view_.appendChild(a), this.curtainView_ = a, Entry.pictureEditable && (a = Entry.createElement("div", "entryPicture"), a.addClass("entryPlaygroundPicturePhone"), a.addClass("entryRemove"), this.view_.appendChild(a), this.generatePictureView(a), this.pictureView_ = a), a = Entry.createElement("div", "entryText"), a.addClass("entryRemove"), this.view_.appendChild(a), this.generateTextView(a), this.textView_ = a, Entry.soundEditable && (a = Entry.createElement("div", "entrySound"), a.addClass("entryPlaygroundSoundWorkspacePhone"), 
  a.addClass("entryRemove"), this.view_.appendChild(a), this.generateSoundView(a), this.soundView_ = a), a = Entry.createElement("div", "entryDefault"), this.view_.appendChild(a), this.generateDefaultView(a), this.defaultView_ = a, a = Entry.createElement("div", "entryCode"), a.addClass("entryPlaygroundCodePhone"), this.view_.appendChild(a), this.generateCodeView(a), this.codeView_ = this.codeView_ = a, Entry.addEventListener("run", function(b) {
    Entry.playground.curtainView_.removeClass("entryRemove");
  }), Entry.addEventListener("stop", function(b) {
    Entry.playground.curtainView_.addClass("entryRemove");
  })) : (this.view_.addClass("entryPlaygroundWorkspace"), a = Entry.createElement("div", "entryCategoryTab"), a.addClass("entryPlaygroundTabWorkspace"), this.view_.appendChild(a), this.generateTabView(a), this.tabView_ = a, a = Entry.createElement("div", "entryCurtain"), a.addClass("entryPlaygroundCurtainWorkspace"), a.addClass("entryRemove"), b = Lang.Workspace.cannot_edit_click_to_stop.split("."), a.innerHTML = b[0] + ".<br/>" + b[1], a.addEventListener("click", function() {
    Entry.engine.toggleStop();
  }), this.view_.appendChild(a), this.curtainView_ = a, Entry.pictureEditable && (a = Entry.createElement("div", "entryPicture"), a.addClass("entryPlaygroundPictureWorkspace"), a.addClass("entryRemove"), this.view_.appendChild(a), this.generatePictureView(a), this.pictureView_ = a), a = Entry.createElement("div", "entryText"), a.addClass("entryPlaygroundTextWorkspace"), a.addClass("entryRemove"), this.view_.appendChild(a), this.generateTextView(a), this.textView_ = a, Entry.soundEditable && (a = 
  Entry.createElement("div", "entrySound"), a.addClass("entryPlaygroundSoundWorkspace"), a.addClass("entryRemove"), this.view_.appendChild(a), this.generateSoundView(a), this.soundView_ = a), a = Entry.createElement("div", "entryDefault"), a.addClass("entryPlaygroundDefaultWorkspace"), this.view_.appendChild(a), this.generateDefaultView(a), this.defaultView_ = a, a = Entry.createElement("div", "entryCode"), a.addClass("entryPlaygroundCodeWorkspace"), a.addClass("entryRemove"), this.view_.appendChild(a), 
  this.generateCodeView(a), this.codeView_ = a, b = Entry.createElement("div"), b.addClass("entryPlaygroundResizeWorkspace", "entryRemove"), this.resizeHandle_ = b, this.view_.appendChild(b), this.initializeResizeHandle(b), this.codeView_ = a, Entry.addEventListener("run", function(b) {
    Entry.playground.curtainView_.removeClass("entryRemove");
  }), Entry.addEventListener("stop", function(b) {
    Entry.playground.curtainView_.addClass("entryRemove");
  }));
};
Entry.Playground.prototype.generateDefaultView = function(a) {
  return a;
};
Entry.Playground.prototype.generateTabView = function(a) {
  var b = this, c = Entry.createElement("ul");
  c.addClass("entryTabListWorkspace");
  this.tabList_ = c;
  a.appendChild(c);
  this.tabViewElements = {};
  a = Entry.createElement("li", "entryCodeTab");
  a.innerHTML = Lang.Workspace.tab_code;
  a.addClass("entryTabListItemWorkspace");
  a.addClass("entryTabSelected");
  c.appendChild(a);
  a.bindOnClick(function(a) {
    b.changeViewMode("code");
    b.blockMenu.reDraw();
  });
  this.tabViewElements.code = a;
  Entry.pictureEditable && (a = Entry.createElement("li", "entryPictureTab"), a.innerHTML = Lang.Workspace.tab_picture, a.addClass("entryTabListItemWorkspace"), c.appendChild(a), a.bindOnClick(function(b) {
    Entry.playground.changeViewMode("picture");
  }), this.tabViewElements.picture = a, a = Entry.createElement("li", "entryTextboxTab"), a.innerHTML = Lang.Workspace.tab_text, a.addClass("entryTabListItemWorkspace"), c.appendChild(a), a.bindOnClick(function(b) {
    Entry.playground.changeViewMode("text");
  }), this.tabViewElements.text = a, a.addClass("entryRemove"));
  Entry.soundEditable && (a = Entry.createElement("li", "entrySoundTab"), a.innerHTML = Lang.Workspace.tab_sound, a.addClass("entryTabListItemWorkspace"), c.appendChild(a), a.bindOnClick(function(b) {
    Entry.playground.changeViewMode("sound");
  }), this.tabViewElements.sound = a);
  Entry.hasVariableManager && (a = Entry.createElement("li", "entryVariableTab"), a.innerHTML = Lang.Workspace.tab_attribute, a.addClass("entryTabListItemWorkspace"), a.addClass("entryVariableTabWorkspace"), c.appendChild(a), a.bindOnClick(function(b) {
    Entry.playground.toggleOnVariableView();
    Entry.playground.changeViewMode("variable");
  }), this.tabViewElements.variable = a);
};
Entry.Playground.prototype.generateCodeView = function(a) {
  var b = this.createVariableView();
  a.appendChild(b);
  this.variableView_ = b;
  a = Entry.Dom(a);
  b = Entry.Dom("div", {parent:a, id:"entryWorkspaceBoard", class:"entryWorkspaceBoard"});
  a = Entry.Dom("div", {parent:a, id:"entryWorkspaceBlockMenu", class:"entryWorkspaceBlockMenu"});
  this.mainWorkspace = new Entry.Workspace({blockMenu:{dom:a, align:"LEFT", categoryData:EntryStatic.getAllBlocks(), scroll:!0}, board:{dom:b}});
  this.blockMenu = this.mainWorkspace.blockMenu;
  this.board = this.mainWorkspace.board;
  this.blockMenu.banClass("checker");
  Entry.hw && this.updateHW();
};
Entry.Playground.prototype.generatePictureView = function(a) {
  if ("workspace" == Entry.type) {
    var b = Entry.createElement("div", "entryAddPicture");
    b.addClass("entryPlaygroundAddPicture");
    b.bindOnClick(function(b) {
      Entry.dispatchEvent("openPictureManager");
    });
    var c = Entry.createElement("div", "entryAddPictureInner");
    c.addClass("entryPlaygroundAddPictureInner");
    c.innerHTML = Lang.Workspace.picture_add;
    b.appendChild(c);
    a.appendChild(b);
    b = Entry.createElement("ul", "entryPictureList");
    b.addClass("entryPlaygroundPictureList");
    $ && $(b).sortable({start:function(b, a) {
      a.item.data("start_pos", a.item.index());
    }, stop:function(b, a) {
      b = a.item.data("start_pos");
      a = a.item.index();
      Entry.playground.movePicture(b, a);
    }, axis:"y"});
    a.appendChild(b);
    this.pictureListView_ = b;
    b = Entry.createElement("div", "entryPainter");
    b.addClass("entryPlaygroundPainter");
    a.appendChild(b);
    this.painter = new Entry.Painter2(b);
  } else {
    "phone" == Entry.type && (b = Entry.createElement("div", "entryAddPicture"), b.addClass("entryPlaygroundAddPicturePhone"), b.bindOnClick(function(b) {
      Entry.dispatchEvent("openPictureManager");
    }), c = Entry.createElement("div", "entryAddPictureInner"), c.addClass("entryPlaygroundAddPictureInnerPhone"), c.innerHTML = Lang.Workspace.picture_add, b.appendChild(c), a.appendChild(b), b = Entry.createElement("ul", "entryPictureList"), b.addClass("entryPlaygroundPictureListPhone"), $ && $(b).sortable({start:function(b, a) {
      a.item.data("start_pos", a.item.index());
    }, stop:function(b, a) {
      b = a.item.data("start_pos");
      a = a.item.index();
      Entry.playground.movePicture(b, a);
    }, axis:"y"}), a.appendChild(b), this.pictureListView_ = b);
  }
};
Entry.Playground.prototype.generateTextView = function(a) {
  var b = Entry.createElement("div");
  a.appendChild(b);
  a = Entry.createElement("div");
  a.addClass("textProperties");
  b.appendChild(a);
  var c = Entry.createElement("div");
  c.addClass("entryTextFontSelect");
  a.appendChild(c);
  var d = Entry.createElement("select", "entryPainterAttrFontName");
  d.addClass("entryPlaygroundPainterAttrFontName", "entryTextFontSelecter");
  d.size = "1";
  d.onchange = function(b) {
    Entry.playground.object.entity.setFontType(b.target.value);
  };
  for (var e = 0;e < Entry.fonts.length;e++) {
    var f = Entry.fonts[e], g = Entry.createElement("option");
    g.value = f.family;
    g.innerHTML = f.name;
    d.appendChild(g);
  }
  this.fontName_ = d;
  c.appendChild(d);
  e = Entry.createElement("ul");
  e.addClass("entryPlayground_text_buttons");
  a.appendChild(e);
  c = Entry.createElement("li");
  c.addClass("entryPlaygroundTextAlignLeft");
  c.bindOnClick(function(b) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_LEFT);
  });
  e.appendChild(c);
  this.alignLeftBtn = c;
  c = Entry.createElement("li");
  c.addClass("entryPlaygroundTextAlignCenter");
  c.bindOnClick(function(b) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_CENTER);
  });
  e.appendChild(c);
  this.alignCenterBtn = c;
  c = Entry.createElement("li");
  c.addClass("entryPlaygroundTextAlignRight");
  c.bindOnClick(function(b) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_RIGHT);
  });
  e.appendChild(c);
  this.alignRightBtn = c;
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    Entry.playground.object.entity.toggleFontBold() ? h.src = Entry.mediaFilePath + "text_button_bold_true.png" : h.src = Entry.mediaFilePath + "text_button_bold_false.png";
  });
  var h = Entry.createElement("img", "entryPlaygroundText_boldImage");
  d.appendChild(h);
  h.src = Entry.mediaFilePath + "text_button_bold_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    var b = !Entry.playground.object.entity.getUnderLine() || !1;
    k.src = Entry.mediaFilePath + "text_button_underline_" + b + ".png";
    Entry.playground.object.entity.setUnderLine(b);
  });
  var k = Entry.createElement("img", "entryPlaygroundText_underlineImage");
  d.appendChild(k);
  k.src = Entry.mediaFilePath + "text_button_underline_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    Entry.playground.object.entity.toggleFontItalic() ? m.src = Entry.mediaFilePath + "text_button_italic_true.png" : m.src = Entry.mediaFilePath + "/text_button_italic_false.png";
  });
  var m = Entry.createElement("img", "entryPlaygroundText_italicImage");
  d.appendChild(m);
  m.src = Entry.mediaFilePath + "text_button_italic_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    var b = !Entry.playground.object.entity.getStrike() || !1;
    Entry.playground.object.entity.setStrike(b);
    l.src = Entry.mediaFilePath + "text_button_strike_" + b + ".png";
  });
  var l = Entry.createElement("img", "entryPlaygroundText_strikeImage");
  d.appendChild(l);
  l.src = Entry.mediaFilePath + "text_button_strike_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    Entry.playground.toggleColourChooser("foreground");
  });
  d = Entry.createElement("img");
  c.appendChild(d);
  d.src = Entry.mediaFilePath + "text_button_color_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  e = Entry.createElement("a");
  c.appendChild(e);
  e.bindOnClick(function() {
    Entry.playground.toggleColourChooser("background");
  });
  c = Entry.createElement("img");
  e.appendChild(c);
  c.src = Entry.mediaFilePath + "text_button_background_false.png";
  e = Entry.createElement("div");
  e.addClass("entryPlayground_fgColorDiv");
  c = Entry.createElement("div");
  c.addClass("entryPlayground_bgColorDiv");
  a.appendChild(e);
  a.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryPlaygroundTextColoursWrapper");
  this.coloursWrapper = d;
  b.appendChild(d);
  a = Entry.getColourCodes();
  for (e = 0;e < a.length;e++) {
    c = Entry.createElement("div"), c.addClass("modal_colour"), c.setAttribute("colour", a[e]), c.style.backgroundColor = a[e], 0 === e && c.addClass("modalColourTrans"), c.bindOnClick(function(b) {
      Entry.playground.setTextColour(b.target.getAttribute("colour"));
    }), d.appendChild(c);
  }
  d.style.display = "none";
  d = Entry.createElement("div");
  d.addClass("entryPlaygroundTextBackgroundsWrapper");
  this.backgroundsWrapper = d;
  b.appendChild(d);
  for (e = 0;e < a.length;e++) {
    c = Entry.createElement("div"), c.addClass("modal_colour"), c.setAttribute("colour", a[e]), c.style.backgroundColor = a[e], 0 === e && c.addClass("modalColourTrans"), c.bindOnClick(function(b) {
      Entry.playground.setBackgroundColour(b.target.getAttribute("colour"));
    }), d.appendChild(c);
  }
  d.style.display = "none";
  a = Entry.createElement("input");
  a.addClass("entryPlayground_textBox");
  a.onkeyup = function() {
    Entry.playground.object.setText(this.value);
    Entry.playground.object.entity.setText(this.value);
  };
  a.onblur = function() {
    Entry.dispatchEvent("textEdited");
  };
  this.textEditInput = a;
  b.appendChild(a);
  a = Entry.createElement("textarea");
  a.addClass("entryPlayground_textArea");
  a.style.display = "none";
  a.onkeyup = function() {
    Entry.playground.object.setText(this.value);
    Entry.playground.object.entity.setText(this.value);
  };
  a.onblur = function() {
    Entry.dispatchEvent("textEdited");
  };
  this.textEditArea = a;
  b.appendChild(a);
  a = Entry.createElement("div");
  a.addClass("entryPlaygroundFontSizeWrapper");
  b.appendChild(a);
  this.fontSizeWrapper = a;
  var n = Entry.createElement("div");
  n.addClass("entryPlaygroundFontSizeSlider");
  a.appendChild(n);
  var q = Entry.createElement("div");
  q.addClass("entryPlaygroundFontSizeIndicator");
  n.appendChild(q);
  this.fontSizeIndiciator = q;
  var r = Entry.createElement("div");
  r.addClass("entryPlaygroundFontSizeKnob");
  n.appendChild(r);
  this.fontSizeKnob = r;
  e = Entry.createElement("div");
  e.addClass("entryPlaygroundFontSizeLabel");
  e.innerHTML = "\uae00\uc790 \ud06c\uae30";
  a.appendChild(e);
  var t = !1, u = 0;
  r.onmousedown = function(b) {
    t = !0;
    u = $(n).offset().left;
  };
  r.addEventListener("touchstart", function(b) {
    t = !0;
    u = $(n).offset().left;
  });
  document.addEventListener("mousemove", function(b) {
    t && (b = b.pageX - u, b = Math.max(b, 5), b = Math.min(b, 88), r.style.left = b + "px", b /= .88, q.style.width = b + "%", Entry.playground.object.entity.setFontSize(b));
  });
  document.addEventListener("touchmove", function(b) {
    t && (b = b.touches[0].pageX - u, b = Math.max(b, 5), b = Math.min(b, 88), r.style.left = b + "px", b /= .88, q.style.width = b + "%", Entry.playground.object.entity.setFontSize(b));
  });
  document.addEventListener("mouseup", function(b) {
    t = !1;
  });
  document.addEventListener("touchend", function(b) {
    t = !1;
  });
  a = Entry.createElement("div");
  a.addClass("entryPlaygroundLinebreakWrapper");
  b.appendChild(a);
  b = Entry.createElement("hr");
  b.addClass("entryPlaygroundLinebreakHorizontal");
  a.appendChild(b);
  b = Entry.createElement("div");
  b.addClass("entryPlaygroundLinebreakButtons");
  a.appendChild(b);
  e = Entry.createElement("img");
  e.bindOnClick(function() {
    Entry.playground.toggleLineBreak(!1);
    v.innerHTML = Lang.Menus.linebreak_off_desc_1;
    x.innerHTML = Lang.Menus.linebreak_off_desc_2;
    y.innerHTML = Lang.Menus.linebreak_off_desc_3;
  });
  e.src = Entry.mediaFilePath + "text-linebreak-off-true.png";
  b.appendChild(e);
  this.linebreakOffImage = e;
  e = Entry.createElement("img");
  e.bindOnClick(function() {
    Entry.playground.toggleLineBreak(!0);
    v.innerHTML = Lang.Menus.linebreak_on_desc_1;
    x.innerHTML = Lang.Menus.linebreak_on_desc_2;
    y.innerHTML = Lang.Menus.linebreak_on_desc_3;
  });
  e.src = Entry.mediaFilePath + "text-linebreak-on-false.png";
  b.appendChild(e);
  this.linebreakOnImage = e;
  b = Entry.createElement("div");
  b.addClass("entryPlaygroundLinebreakDescription");
  a.appendChild(b);
  var v = Entry.createElement("p");
  v.innerHTML = Lang.Menus.linebreak_off_desc_1;
  b.appendChild(v);
  a = Entry.createElement("ul");
  b.appendChild(a);
  var x = Entry.createElement("li");
  x.innerHTML = Lang.Menus.linebreak_off_desc_2;
  a.appendChild(x);
  var y = Entry.createElement("li");
  y.innerHTML = Lang.Menus.linebreak_off_desc_3;
  a.appendChild(y);
};
Entry.Playground.prototype.generateSoundView = function(a) {
  if ("workspace" == Entry.type) {
    var b = Entry.createElement("div", "entryAddSound");
    b.addClass("entryPlaygroundAddSound");
    b.bindOnClick(function(b) {
      Entry.dispatchEvent("openSoundManager");
    });
    var c = Entry.createElement("div", "entryAddSoundInner");
    c.addClass("entryPlaygroundAddSoundInner");
    c.innerHTML = Lang.Workspace.sound_add;
    b.appendChild(c);
    a.appendChild(b);
    b = Entry.createElement("ul", "entrySoundList");
    b.addClass("entryPlaygroundSoundList");
    $ && $(b).sortable({start:function(b, a) {
      a.item.data("start_pos", a.item.index());
    }, stop:function(b, a) {
      b = a.item.data("start_pos");
      a = a.item.index();
      Entry.playground.moveSound(b, a);
    }, axis:"y"});
    a.appendChild(b);
    this.soundListView_ = b;
  } else {
    "phone" == Entry.type && (b = Entry.createElement("div", "entryAddSound"), b.addClass("entryPlaygroundAddSoundPhone"), b.bindOnClick(function(b) {
      Entry.dispatchEvent("openSoundManager");
    }), c = Entry.createElement("div", "entryAddSoundInner"), c.addClass("entryPlaygroundAddSoundInnerPhone"), c.innerHTML = Lang.Workspace.sound_add, b.appendChild(c), a.appendChild(b), b = Entry.createElement("ul", "entrySoundList"), b.addClass("entryPlaygroundSoundListPhone"), $ && $(b).sortable({start:function(b, a) {
      a.item.data("start_pos", a.item.index());
    }, stop:function(b, a) {
      b = a.item.data("start_pos");
      a = a.item.index();
      Entry.playground.moveSound(b, a);
    }, axis:"y"}), a.appendChild(b), this.soundListView_ = b);
  }
};
Entry.Playground.prototype.injectObject = function(a) {
  if (!a) {
    this.changeViewMode("code"), this.object = null;
  } else {
    if (a !== this.object) {
      this.object && this.object.toggleInformation(!1);
      this.object = a;
      this.setMenu(a.objectType);
      this.injectCode();
      "sprite" == a.objectType && Entry.pictureEditable ? (this.tabViewElements.text && this.tabViewElements.text.addClass("entryRemove"), this.tabViewElements.picture && this.tabViewElements.picture.removeClass("entryRemove")) : "textBox" == a.objectType && (this.tabViewElements.picture && this.tabViewElements.picture.addClass("entryRemove"), this.tabViewElements.text && this.tabViewElements.text.removeClass("entryRemove"));
      var b = this.viewMode_;
      "default" == b ? this.changeViewMode("code") : "picture" != b && "text" != b || "textBox" != a.objectType ? "text" != b && "picture" != b || "sprite" != a.objectType ? "sound" == b && this.changeViewMode("sound") : this.changeViewMode("picture") : this.changeViewMode("text");
      this.reloadPlayground();
    }
  }
};
Entry.Playground.prototype.injectCode = function() {
  var a = this.mainWorkspace;
  a.changeBoardCode(this.object.script);
  a.getBoard().adjustThreadsPosition();
};
Entry.Playground.prototype.injectPicture = function() {
  var a = this.pictureListView_;
  if (a) {
    for (;a.hasChildNodes();) {
      a.removeChild(a.lastChild);
    }
    if (this.object) {
      for (var b = this.object.pictures, c = 0, d = b.length;c < d;c++) {
        var e = b[c].view;
        e || console.log(e);
        e.orderHolder.innerHTML = c + 1;
        a.appendChild(e);
      }
      this.selectPicture(this.object.selectedPicture);
    } else {
      Entry.dispatchEvent("pictureClear");
    }
  }
};
Entry.Playground.prototype.addPicture = function(a, b) {
  a = Entry.cloneSimpleObject(a);
  delete a.id;
  delete a.view;
  a = JSON.parse(JSON.stringify(a));
  a.id = Entry.generateHash();
  a.name = Entry.getOrderedName(a.name, this.object.pictures);
  this.generatePictureElement(a);
  this.object.addPicture(a);
  this.injectPicture();
  this.selectPicture(a);
};
Entry.Playground.prototype.setPicture = function(a) {
  var b = Entry.container.getPictureElement(a.id, a.objectId), c = $(b);
  if (b) {
    a.view = b;
    b.picture = a;
    b = c.find("#t_" + a.id)[0];
    if (a.fileurl) {
      b.style.backgroundImage = 'url("' + a.fileurl + '")';
    } else {
      var d = a.filename;
      b.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + d.substring(0, 2) + "/" + d.substring(2, 4) + "/thumb/" + d + '.png")';
    }
    c.find("#s_" + a.id)[0].innerHTML = a.dimension.width + " X " + a.dimension.height;
  }
  Entry.container.setPicture(a);
};
Entry.Playground.prototype.downloadPicture = function(a) {
  a = Entry.playground.object.getPicture(a);
  a.fileurl ? window.open(a.fileurl) : window.open("/api/sprite/download/image/" + encodeURIComponent(a.filename) + "/" + encodeURIComponent(a.name) + ".png");
};
Entry.Playground.prototype.clonePicture = function(a) {
  a = Entry.playground.object.getPicture(a);
  this.addPicture(a, !0);
};
Entry.Playground.prototype.selectPicture = function(a) {
  for (var b = this.object.pictures, c = 0, d = b.length;c < d;c++) {
    var e = b[c];
    e.id === a.id ? e.view.addClass("entryPictureSelected") : e.view.removeClass("entryPictureSelected");
  }
  var f;
  a && a.id && (f = Entry.container.selectPicture(a.id, a.objectId));
  this.object.id === f && Entry.dispatchEvent("pictureSelected", a);
};
Entry.Playground.prototype.movePicture = function(a, b) {
  this.object.pictures.splice(b, 0, this.object.pictures.splice(a, 1)[0]);
  this.injectPicture();
  Entry.stage.sortZorder();
};
Entry.Playground.prototype.injectText = function() {
  if (Entry.playground.object) {
    Entry.playground.textEditInput.value = Entry.playground.object.entity.getText();
    Entry.playground.textEditArea.value = Entry.playground.object.entity.getText();
    Entry.playground.fontName_.value = Entry.playground.object.entity.getFontName();
    if (Entry.playground.object.entity.font) {
      var a = -1 < Entry.playground.object.entity.font.indexOf("bold") || !1;
      $("#entryPlaygroundText_boldImage").attr("src", Entry.mediaFilePath + "text_button_bold_" + a + ".png");
      a = -1 < Entry.playground.object.entity.font.indexOf("italic") || !1;
      $("#entryPlaygroundText_italicImage").attr("src", Entry.mediaFilePath + "text_button_italic_" + a + ".png");
    }
    a = Entry.playground.object.entity.getUnderLine() || !1;
    $("#entryPlaygroundText_underlineImage").attr("src", Entry.mediaFilePath + "text_button_underline_" + a + ".png");
    a = Entry.playground.object.entity.getStrike() || !1;
    $("#entryPlaygroundText_strikeImage").attr("src", Entry.mediaFilePath + "text_button_strike_" + a + ".png");
    $(".entryPlayground_fgColorDiv").css("backgroundColor", Entry.playground.object.entity.colour);
    $(".entryPlayground_bgColorDiv").css("backgroundColor", Entry.playground.object.entity.bgColour);
    Entry.playground.toggleLineBreak(Entry.playground.object.entity.getLineBreak());
    Entry.playground.object.entity.getLineBreak() && ($(".entryPlaygroundLinebreakDescription > p").html(Lang.Menus.linebreak_on_desc_1), $(".entryPlaygroundLinebreakDescription > ul > li").eq(0).html(Lang.Menus.linebreak_on_desc_2), $(".entryPlaygroundLinebreakDescription > ul > li").eq(1).html(Lang.Menus.linebreak_on_desc_3));
    Entry.playground.setFontAlign(Entry.playground.object.entity.getTextAlign());
    a = Entry.playground.object.entity.getFontSize();
    Entry.playground.fontSizeIndiciator.style.width = a + "%";
    Entry.playground.fontSizeKnob.style.left = .88 * a + "px";
  }
};
Entry.Playground.prototype.injectSound = function() {
  var a = this.soundListView_;
  if (a) {
    for (;a.hasChildNodes();) {
      a.removeChild(a.lastChild);
    }
    if (this.object) {
      for (var b = this.object.sounds, c = 0, d = b.length;c < d;c++) {
        var e = b[c].view;
        e.orderHolder.innerHTML = c + 1;
        a.appendChild(e);
      }
    }
  }
};
Entry.Playground.prototype.moveSound = function(a, b) {
  this.object.sounds.splice(b, 0, this.object.sounds.splice(a, 1)[0]);
  this.updateListViewOrder("sound");
  Entry.stage.sortZorder();
};
Entry.Playground.prototype.addSound = function(a, b) {
  a = Entry.cloneSimpleObject(a);
  delete a.view;
  delete a.id;
  a = JSON.parse(JSON.stringify(a));
  a.id = Entry.generateHash();
  a.name = Entry.getOrderedName(a.name, this.object.sounds);
  this.generateSoundElement(a);
  this.object.addSound(a);
  this.injectSound();
};
Entry.Playground.prototype.changeViewMode = function(a) {
  for (var b in this.tabViewElements) {
    this.tabViewElements[b].removeClass("entryTabSelected");
  }
  "default" != a && this.tabViewElements[a].addClass("entryTabSelected");
  if ("variable" != a) {
    var c = this.view_.children;
    for (b = 0;b < c.length;b++) {
      var d = c[b];
      -1 < d.id.toUpperCase().indexOf(a.toUpperCase()) ? d.removeClass("entryRemove") : d.addClass("entryRemove");
    }
    Entry.pictureEditable && ("picture" == a ? (this.painter.show(), this.pictureView_.object && this.pictureView_.object == this.object || (this.pictureView_.object = this.object, this.injectPicture())) : this.painter.hide());
    if ("sound" == a && (!this.soundView_.object || this.soundView_.object != this.object)) {
      this.soundView_.object = this.object, this.injectSound();
    } else {
      if ("text" == a && "textBox" == this.object.objectType || this.textView_.object != this.object) {
        this.textView_.object = this.object, this.injectText();
      }
    }
    "code" == a && this.resizeHandle_ && this.resizeHandle_.removeClass("entryRemove");
    Entry.engine.isState("run") && this.curtainView_.removeClass("entryRemove");
    this.viewMode_ = a;
    this.toggleOffVariableView();
  }
};
Entry.Playground.prototype.createVariableView = function() {
  var a = Entry.createElement("div");
  Entry.type && "workspace" != Entry.type ? "phone" == Entry.type && a.addClass("entryVariablePanelPhone") : a.addClass("entryVariablePanelWorkspace");
  this.variableViewWrapper_ = a;
  Entry.variableContainer.createDom(a);
  return a;
};
Entry.Playground.prototype.toggleOnVariableView = function() {
  Entry.playground.changeViewMode("code");
  this.hideBlockMenu();
  Entry.variableContainer.updateList();
  this.variableView_.removeClass("entryRemove");
  this.resizeHandle_.removeClass("entryRemove");
};
Entry.Playground.prototype.toggleOffVariableView = function() {
  this.showBlockMenu();
  this.variableView_.addClass("entryRemove");
};
Entry.Playground.prototype.editBlock = function() {
  var a = Entry.playground;
  Entry.stateManager && Entry.stateManager.addCommand("edit block", a, a.restoreBlock, a.object, a.object.getScriptText());
};
Entry.Playground.prototype.mouseupBlock = function() {
  if (Entry.reporter) {
    var a = Entry.playground, b = a.object;
    Entry.reporter.report(new Entry.State("edit block mouseup", a, a.restoreBlock, b, b.getScriptText()));
  }
};
Entry.Playground.prototype.restoreBlock = function(a, b) {
  Entry.container.selectObject(a.id);
  Entry.stateManager && Entry.stateManager.addCommand("restore block", this, this.restoreBlock, this.object, this.object.getScriptText());
  Blockly.Xml.textToDom(b);
};
Entry.Playground.prototype.setMenu = function(a) {
  if (this.currentObjectType != a) {
    var b = this.blockMenu;
    b.unbanClass(this.currentObjectType);
    b.banClass(a);
    b.setMenu();
    b.selectMenu(0, !0);
    this.currentObjectType = a;
  }
};
Entry.Playground.prototype.hideTabs = function() {
  var a = ["picture", "text", "sound", "variable"], b;
  for (b in a) {
    this.hideTab([a[b]]);
  }
};
Entry.Playground.prototype.hideTab = function(a) {
  this.tabViewElements[a] && (this.tabViewElements[a].addClass("hideTab"), this.tabViewElements[a].removeClass("showTab"));
};
Entry.Playground.prototype.showTabs = function() {
  var a = ["picture", "text", "sound", "variable"], b;
  for (b in a) {
    this.showTab(a[b]);
  }
};
Entry.Playground.prototype.showTab = function(a) {
  this.tabViewElements[a] && (this.tabViewElements[a].addClass("showTab"), this.tabViewElements[a].removeClass("hideTab"));
};
Entry.Playground.prototype.initializeResizeHandle = function(a) {
  $(a).bind("mousedown touchstart", function(b) {
    Entry.playground.resizing = !0;
    Entry.documentMousemove && (Entry.playground.resizeEvent = Entry.documentMousemove.attach(this, function(b) {
      Entry.playground.resizing && Entry.resizeElement({menuWidth:b.clientX - Entry.interfaceState.canvasWidth});
    }));
  });
  $(document).bind("mouseup touchend", function(b) {
    if (b = Entry.playground.resizeEvent) {
      Entry.playground.resizing = !1, Entry.documentMousemove.detach(b), delete Entry.playground.resizeEvent;
    }
  });
};
Entry.Playground.prototype.reloadPlayground = function() {
  var a = this.mainWorkspace;
  a && (a.getBlockMenu().reDraw(), this.object && this.object.script.view.reDraw());
};
Entry.Playground.prototype.flushPlayground = function() {
  this.object = null;
  if (Entry.playground && Entry.playground.view_) {
    this.injectPicture();
    this.injectSound();
    var a = Entry.playground.mainWorkspace.getBoard();
    a.clear();
    a.changeCode(null);
  }
};
Entry.Playground.prototype.refreshPlayground = function() {
  Entry.playground && Entry.playground.view_ && ("picture" === this.getViewMode() && this.injectPicture(), "sound" === this.getViewMode() && this.injectSound());
};
Entry.Playground.prototype.updateListViewOrder = function(a) {
  a = "picture" == a ? this.pictureListView_.childNodes : this.soundListView_.childNodes;
  for (var b = 0, c = a.length;b < c;b++) {
    a[b].orderHolder.innerHTML = b + 1;
  }
};
Entry.Playground.prototype.generatePictureElement = function(a) {
  function b() {
    if ("" === this.value.trim()) {
      Entry.deAttachEventListener(this, "blur", b), alert("\uc774\ub984\uc744 \uc785\ub825\ud558\uc5ec \uc8fc\uc138\uc694."), this.focus(), Entry.attachEventListener(this, "blur", b);
    } else {
      for (var a = $(".entryPlaygroundPictureName"), c = 0;c < a.length;c++) {
        if (a.eq(c).val() == f.value && a[c] != this) {
          Entry.deAttachEventListener(this, "blur", b);
          alert("\uc774\ub984\uc774 \uc911\ubcf5 \ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
          this.focus();
          Entry.attachEventListener(this, "blur", b);
          return;
        }
      }
      a = this.value;
      this.picture.name = a;
      if (c = Entry.playground) {
        if (c.object) {
          var d = c.object.getPicture(this.picture.id);
          d && (d.name = a);
        }
        (d = c.painter) && d.file && (d.file.name = a);
        c.reloadPlayground();
      }
      Entry.dispatchEvent("pictureNameChanged", this.picture);
    }
  }
  var c = Entry.createElement("li", a.id);
  a.view = c;
  c.addClass("entryPlaygroundPictureElement");
  c.picture = a;
  c.bindOnClick(function(b) {
    Entry.playground.selectPicture(this.picture);
  });
  Entry.Utils.disableContextmenu(a.view);
  $(a.view).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function() {
      f.focus();
    }}, {text:Lang.Workspace.context_duplicate, callback:function() {
      Entry.playground.clonePicture(a.id);
    }}, {text:Lang.Workspace.context_remove, callback:function() {
      Entry.playground.object.removePicture(a.id) ? (Entry.removeElement(c), Entry.toast.success(Lang.Workspace.shape_remove_ok, a.name + " " + Lang.Workspace.shape_remove_ok_msg)) : Entry.toast.alert(Lang.Workspace.shape_remove_fail, Lang.Workspace.shape_remove_fail_msg);
    }}, {divider:!0}, {text:Lang.Workspace.context_download, callback:function() {
      Entry.playground.downloadPicture(a.id);
    }}], "workspace-contextmenu");
  });
  var d = Entry.createElement("div");
  d.addClass("entryPlaygroundPictureOrder");
  c.orderHolder = d;
  c.appendChild(d);
  d = Entry.createElement("div", "t_" + a.id);
  d.addClass("entryPlaygroundPictureThumbnail");
  if (a.fileurl) {
    d.style.backgroundImage = 'url("' + a.fileurl + '")';
  } else {
    var e = a.filename;
    d.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + e.substring(0, 2) + "/" + e.substring(2, 4) + "/thumb/" + e + '.png")';
  }
  c.appendChild(d);
  var f = Entry.createElement("input");
  f.addClass("entryPlaygroundPictureName");
  f.addClass("entryEllipsis");
  f.picture = a;
  f.value = a.name;
  Entry.attachEventListener(f, "blur", b);
  f.onkeypress = function(b) {
    13 == b.keyCode && this.blur();
  };
  c.appendChild(f);
  d = Entry.createElement("div", "s_" + a.id);
  d.addClass("entryPlaygroundPictureSize");
  d.innerHTML = a.dimension.width + " X " + a.dimension.height;
  c.appendChild(d);
};
Entry.Playground.prototype.generateSoundElement = function(a) {
  var b = Entry.createElement("sound", a.id);
  a.view = b;
  b.addClass("entryPlaygroundSoundElement");
  b.sound = a;
  Entry.Utils.disableContextmenu(a.view);
  $(a.view).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function() {
      g.focus();
    }}, {text:Lang.Workspace.context_duplicate, callback:function() {
      Entry.playground.addSound(a, !0);
    }}, {text:Lang.Workspace.context_remove, callback:function() {
      Entry.playground.object.removeSound(a.id) ? (Entry.removeElement(b), Entry.toast.success(Lang.Workspace.sound_remove_ok, a.name + " " + Lang.Workspace.sound_remove_ok_msg)) : Entry.toast.alert(Lang.Workspace.sound_remove_fail, "");
      Entry.removeElement(b);
    }}], "workspace-contextmenu");
  });
  var c = Entry.createElement("div");
  c.addClass("entryPlaygroundSoundOrder");
  b.orderHolder = c;
  b.appendChild(c);
  var d = Entry.createElement("div");
  d.addClass("entryPlaygroundSoundThumbnail");
  d.addClass("entryPlaygroundSoundPlay");
  var e = !1, f;
  d.addEventListener("click", function() {
    e ? (e = !1, d.removeClass("entryPlaygroundSoundStop"), d.addClass("entryPlaygroundSoundPlay"), f.stop()) : (e = !0, d.removeClass("entryPlaygroundSoundPlay"), d.addClass("entryPlaygroundSoundStop"), f = createjs.Sound.play(a.id), f.addEventListener("complete", function(b) {
      d.removeClass("entryPlaygroundSoundStop");
      d.addClass("entryPlaygroundSoundPlay");
      e = !1;
    }), f.addEventListener("loop", function(b) {
    }), f.addEventListener("failed", function(b) {
    }));
  });
  b.appendChild(d);
  var g = Entry.createElement("input");
  g.addClass("entryPlaygroundSoundName");
  g.sound = a;
  g.value = a.name;
  var h = document.getElementsByClassName("entryPlaygroundSoundName");
  g.onblur = function() {
    if ("" === this.value) {
      alert("\uc774\ub984\uc744 \uc785\ub825\ud558\uc5ec \uc8fc\uc138\uc694."), this.focus();
    } else {
      for (var b = 0, a = 0;a < h.length;a++) {
        if (h[a].value == g.value && (b += 1, 1 < b)) {
          alert("\uc774\ub984\uc774 \uc911\ubcf5 \ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
          this.focus();
          return;
        }
      }
      this.sound.name = this.value;
      Entry.playground.reloadPlayground();
    }
  };
  g.onkeypress = function(b) {
    13 == b.keyCode && this.blur();
  };
  b.appendChild(g);
  c = Entry.createElement("div");
  c.addClass("entryPlaygroundSoundLength");
  c.innerHTML = a.duration + " \ucd08";
  b.appendChild(c);
};
Entry.Playground.prototype.toggleColourChooser = function(a) {
  "foreground" === a ? "none" === this.coloursWrapper.style.display ? (this.coloursWrapper.style.display = "block", this.backgroundsWrapper.style.display = "none") : this.coloursWrapper.style.display = "none" : "background" === a && ("none" === this.backgroundsWrapper.style.display ? (this.backgroundsWrapper.style.display = "block", this.coloursWrapper.style.display = "none") : this.backgroundsWrapper.style.display = "none");
};
Entry.Playground.prototype.setTextColour = function(a) {
  Entry.playground.object.entity.setColour(a);
  Entry.playground.toggleColourChooser("foreground");
  $(".entryPlayground_fgColorDiv").css("backgroundColor", a);
};
Entry.Playground.prototype.setBackgroundColour = function(a) {
  Entry.playground.object.entity.setBGColour(a);
  Entry.playground.toggleColourChooser("background");
  $(".entryPlayground_bgColorDiv").css("backgroundColor", a);
};
Entry.Playground.prototype.isTextBGMode = function() {
  return this.isTextBGMode_;
};
Entry.Playground.prototype.checkVariables = function() {
  Entry.forEBS || (Entry.variableContainer.lists_.length ? this.blockMenu.unbanClass("listNotExist") : this.blockMenu.banClass("listNotExist"), Entry.variableContainer.variables_.length ? this.blockMenu.unbanClass("variableNotExist") : this.blockMenu.banClass("variableNotExist"));
};
Entry.Playground.prototype.getViewMode = function() {
  return this.viewMode_;
};
Entry.Playground.prototype.updateHW = function() {
  var a = Entry.playground.mainWorkspace.blockMenu;
  if (a) {
    var b = Entry.hw;
    b && b.connected ? (a.unbanClass("arduinoConnected", !0), a.banClass("arduinoDisconnected", !0), b.banHW(), b.hwModule && a.unbanClass(b.hwModule.name)) : (a.banClass("arduinoConnected", !0), a.unbanClass("arduinoDisconnected", !0), Entry.hw.banHW());
    a.reDraw();
  }
};
Entry.Playground.prototype.toggleLineBreak = function(a) {
  this.object && "textBox" == this.object.objectType && (a ? (Entry.playground.object.entity.setLineBreak(!0), $(".entryPlayground_textArea").css("display", "block"), $(".entryPlayground_textBox").css("display", "none"), this.linebreakOffImage.src = Entry.mediaFilePath + "text-linebreak-off-false.png", this.linebreakOnImage.src = Entry.mediaFilePath + "text-linebreak-on-true.png", this.fontSizeWrapper.removeClass("entryHide")) : (Entry.playground.object.entity.setLineBreak(!1), $(".entryPlayground_textArea").css("display", 
  "none"), $(".entryPlayground_textBox").css("display", "block"), this.linebreakOffImage.src = Entry.mediaFilePath + "text-linebreak-off-true.png", this.linebreakOnImage.src = Entry.mediaFilePath + "text-linebreak-on-false.png", this.fontSizeWrapper.addClass("entryHide")));
};
Entry.Playground.prototype.setFontAlign = function(a) {
  if ("textBox" == this.object.objectType) {
    this.alignLeftBtn.removeClass("toggle");
    this.alignCenterBtn.removeClass("toggle");
    this.alignRightBtn.removeClass("toggle");
    switch(a) {
      case Entry.TEXT_ALIGN_LEFT:
        this.alignLeftBtn.addClass("toggle");
        break;
      case Entry.TEXT_ALIGN_CENTER:
        this.alignCenterBtn.addClass("toggle");
        break;
      case Entry.TEXT_ALIGN_RIGHT:
        this.alignRightBtn.addClass("toggle");
    }
    this.object.entity.setTextAlign(a);
  }
};
Entry.Playground.prototype.hideBlockMenu = function() {
  this.mainWorkspace.getBlockMenu().hide();
};
Entry.Playground.prototype.showBlockMenu = function() {
  this.mainWorkspace.getBlockMenu().show();
};
Entry.Popup = function() {
  Entry.assert(!window.popup, "Popup exist");
  this.body_ = Entry.createElement("div");
  this.body_.addClass("entryPopup");
  this.body_.bindOnClick(function(a) {
    a.target == this && this.popup.remove();
  });
  this.body_.popup = this;
  document.body.appendChild(this.body_);
  this.window_ = Entry.createElement("div");
  this.window_.addClass("entryPopupWindow");
  "tablet" === Entry.device && this.window_.addClass("tablet");
  this.window_.bindOnClick(function() {
  });
  Entry.addEventListener("windowResized", this.resize);
  window.popup = this;
  this.resize();
  this.body_.appendChild(this.window_);
};
Entry.Popup.prototype.remove = function() {
  for (;this.window_.hasChildNodes();) {
    "workspace" == Entry.type ? Entry.view_.insertBefore(this.window_.firstChild, Entry.container.view_) : Entry.view_.insertBefore(this.window_.lastChild, Entry.view_.firstChild);
  }
  $("body").css("overflow", "auto");
  Entry.removeElement(this.body_);
  window.popup = null;
  Entry.removeEventListener("windowResized", this.resize);
  Entry.engine.popup = null;
  Entry.windowResized.notify();
};
Entry.Popup.prototype.resize = function(a) {
  a = window.popup.window_;
  var b = .9 * window.innerWidth, c = .9 * window.innerHeight - 35;
  9 * b <= 16 * c ? c = b / 16 * 9 + 35 : (b = 16 * c / 9, c += 35);
  a.style.width = String(b) + "px";
  a.style.height = String(c) + "px";
  Entry.stage && Entry.stage.updateBoundRect();
};
Entry.popupHelper = function(a) {
  this.popupList = {};
  this.nextPopupList = [];
  this.nowContent;
  a && (window.popupHelper = null);
  Entry.assert(!window.popupHelper, "Popup exist");
  var b = ["confirm", "spinner"], c = ["entryPopupHelperTopSpan", "entryPopupHelperBottomSpan", "entryPopupHelperLeftSpan", "entryPopupHelperRightSpan"];
  this.body_ = Entry.Dom("div", {classes:["entryPopup", "hiddenPopup", "popupHelper"]});
  var d = this;
  this.body_.bindOnClick(function(a) {
    if (!(d.nowContent && -1 < b.indexOf(d.nowContent.prop("type")))) {
      var e = $(a.target);
      c.forEach(function(b) {
        e.hasClass(b) && d.hide();
      });
      a.target == d && d.hide();
    }
  });
  window.popupHelper = this;
  this.body_.prop("popup", this);
  Entry.Dom("div", {class:"entryPopupHelperTopSpan", parent:this.body_});
  a = Entry.Dom("div", {class:"entryPopupHelperMiddleSpan", parent:this.body_});
  Entry.Dom("div", {class:"entryPopupHelperBottomSpan", parent:this.body_});
  Entry.Dom("div", {class:"entryPopupHelperLeftSpan", parent:a});
  this.window_ = Entry.Dom("div", {class:"entryPopupHelperWindow", parent:a});
  Entry.Dom("div", {class:"entryPopupHelperRightSpan", parent:a});
  $("body").append(this.body_);
};
Entry.popupHelper.prototype.clearPopup = function() {
  for (var a = this.popupWrapper_.children.length - 1;2 < a;a--) {
    this.popupWrapper_.removeChild(this.popupWrapper_.children[a]);
  }
};
Entry.popupHelper.prototype.addPopup = function(a, b) {
  var c = Entry.Dom("div"), d = Entry.Dom("div", {class:"entryPopupHelperCloseButton"});
  d.bindOnClick(function() {
    b.closeEvent ? b.closeEvent(this) : this.hide();
  }.bind(this));
  var e = Entry.Dom("div", {class:"entryPopupHelperWrapper"});
  e.append(d);
  b.title && (d = Entry.Dom("div", {class:"entryPopupHelperTitle"}), e.append(d), d.text(b.title));
  c.addClass(a);
  c.append(e);
  c.popupWrapper_ = e;
  c.prop("type", b.type);
  "function" === typeof b.setPopupLayout && b.setPopupLayout(c);
  c._obj = b;
  this.popupList[a] = c;
};
Entry.popupHelper.prototype.hasPopup = function(a) {
  return !!this.popupList[a];
};
Entry.popupHelper.prototype.setPopup = function(a) {
};
Entry.popupHelper.prototype.remove = function(a) {
  0 < this.window_.children().length && this.window_.children().remove();
  delete this.popupList[a];
  this.nowContent = void 0;
  this.body_.addClass("hiddenPopup");
  0 < this.nextPopupList.length && this.show(this.nextPopupList.shift());
};
Entry.popupHelper.prototype.resize = function(a) {
};
Entry.popupHelper.prototype.show = function(a, b) {
  function c(b) {
    d.window_.append(d.popupList[b]);
    d.nowContent = d.popupList[b];
    d.body_.removeClass("hiddenPopup");
  }
  var d = this;
  b ? 0 < this.window_.children().length ? this.nextPopupList.push(a) : (this.window_.children().detach(), c(a)) : (this.window_.children().detach(), c(a));
  if (this.nowContent && this.nowContent._obj && this.nowContent._obj.onShow) {
    this.nowContent._obj.onShow();
  }
};
Entry.popupHelper.prototype.hide = function() {
  this.nowContent = void 0;
  this.body_.addClass("hiddenPopup");
  this.window_.children().detach();
  0 < this.nextPopupList.length && this.show(this.nextPopupList.shift());
};
Entry.getStartProject = function(a) {
  return {category:"\uae30\ud0c0", scenes:[{name:"\uc7a5\uba74 1", id:"7dwq"}], variables:[{name:"\ucd08\uc2dc\uacc4", id:"brih", visible:!1, value:"0", variableType:"timer", x:150, y:-70, array:[], object:null, isCloud:!1}, {name:"\ub300\ub2f5", id:"1vu8", visible:!1, value:"0", variableType:"answer", x:150, y:-100, array:[], object:null, isCloud:!1}], objects:[{id:"7y0y", name:"\uc5d4\ud2b8\ub9ac\ubd07", script:[[{type:"when_run_button_click", x:40, y:50}, {type:"repeat_basic", statements:[[{type:"move_direction"}]]}]], 
  selectedPictureId:"vx80", objectType:"sprite", rotateMethod:"free", scene:"7dwq", sprite:{sounds:[{duration:1.3, ext:".mp3", id:"8el5", fileurl:a + "media/bark.mp3", name:"\uac15\uc544\uc9c0 \uc9d6\ub294\uc18c\ub9ac"}], pictures:[{id:"vx80", fileurl:a + "media/entrybot1.png", name:Lang.Blocks.walking_entryBot + "1", scale:100, dimension:{width:284, height:350}}, {id:"4t48", fileurl:a + "media/entrybot2.png", name:Lang.Blocks.walking_entryBot + "2", scale:100, dimension:{width:284, height:350}}]}, 
  entity:{x:0, y:0, regX:142, regY:175, scaleX:.3154574132492113, scaleY:.3154574132492113, rotation:0, direction:90, width:284, height:350, visible:!0}, lock:!1, active:!0}], speed:60};
};
Entry.Reporter = function(a) {
  this.projectId = this.userId = null;
  this.isRealTime = a;
  this.activities = [];
};
Entry.Reporter.prototype.start = function(a, b, c) {
  this.isRealTime && (-1 < window.location.href.indexOf("localhost") ? this.io = io("localhost:7000") : this.io = io("play04.play-entry.com:7000"), this.io.emit("activity", {message:"start", userId:b, projectId:a, time:c}));
  this.userId = b;
  this.projectId = a;
};
Entry.Reporter.prototype.report = function(a) {
  if (!this.isRealTime || this.io) {
    var b = [], c;
    for (c in a.params) {
      var d = a.params[c];
      "object" !== typeof d ? b.push(d) : d.id && b.push(d.id);
    }
    a = {message:a.message, userId:this.userId, projectId:this.projectId, time:a.time, params:b};
    this.isRealTime ? this.io.emit("activity", a) : this.activities.push(a);
  }
};
Entry.Scene = function() {
  var a = this;
  this.scenes_ = [];
  this.selectedScene = null;
  this.maxCount = 20;
  $(window).on("resize", function(b) {
    a.resize();
  });
};
Entry.Scene.viewBasicWidth = 70;
Entry.Scene.prototype.generateView = function(a, b) {
  var c = this;
  this.view_ = a;
  this.view_.addClass("entryScene");
  b && "workspace" != b || (this.view_.addClass("entrySceneWorkspace"), $(this.view_).on("mousedown", function(b) {
    var a = $(this).offset(), d = $(window), g = b.pageX - a.left + d.scrollLeft();
    b = b.pageY - a.top + d.scrollTop();
    b = 40 - b;
    a = -40 / 55;
    d = $(c.selectedScene.view).find(".entrySceneRemoveButtonCoverWorkspace").offset().left;
    !(g < d || g > d + 55) && b > 40 + a * (g - d) && (g = c.getNextScene()) && (g = $(g.view), $(document).trigger("mouseup"), g.trigger("mousedown"));
  }), a = Entry.createElement("ul"), a.addClass("entrySceneListWorkspace"), Entry.sceneEditable && $ && $(a).sortable({start:function(b, a) {
    a.item.data("start_pos", a.item.index());
    $(a.item[0]).clone(!0);
  }, stop:function(b, a) {
    b = a.item.data("start_pos");
    a = a.item.index();
    Entry.scene.moveScene(b, a);
  }, axis:"x", tolerance:"pointer"}), this.view_.appendChild(a), this.listView_ = a, Entry.sceneEditable && (a = Entry.createElement("span"), a.addClass("entrySceneElementWorkspace"), a.addClass("entrySceneAddButtonWorkspace"), a.bindOnClick(function(b) {
    Entry.engine.isState("run") || Entry.scene.addScene();
  }), this.view_.appendChild(a), this.addButton_ = a));
};
Entry.Scene.prototype.generateElement = function(a) {
  var b = this, c = Entry.createElement("li", a.id);
  c.addClass("entrySceneElementWorkspace");
  c.addClass("entrySceneButtonWorkspace");
  c.addClass("minValue");
  $(c).on("mousedown", function(b) {
    Entry.engine.isState("run") ? b.preventDefault() : Entry.scene.selectScene(a);
  });
  var d = Entry.createElement("input");
  d.addClass("entrySceneFieldWorkspace");
  d.value = a.name;
  Entry.sceneEditable || (d.disabled = "disabled");
  var e = Entry.createElement("span");
  e.addClass("entrySceneLeftWorkspace");
  c.appendChild(e);
  var f = Entry.createElement("span");
  f.addClass("entrySceneInputCover");
  f.style.width = Entry.computeInputWidth(a.name);
  c.appendChild(f);
  a.inputWrapper = f;
  d.onkeyup = function(c) {
    c = c.keyCode;
    Entry.isArrowOrBackspace(c) || (a.name = this.value, f.style.width = Entry.computeInputWidth(a.name), b.resize(), 13 == c && this.blur(), 10 < this.value.length && (this.value = this.value.substring(0, 10), this.blur()));
  };
  d.onblur = function(b) {
    d.value = this.value;
    a.name = this.value;
    f.style.width = Entry.computeInputWidth(a.name);
  };
  f.appendChild(d);
  e = Entry.createElement("span");
  e.addClass("entrySceneRemoveButtonCoverWorkspace");
  c.appendChild(e);
  if (Entry.sceneEditable) {
    var g = Entry.createElement("button");
    g.addClass("entrySceneRemoveButtonWorkspace");
    g.scene = a;
    g.bindOnClick(function(b) {
      b.stopPropagation();
      Entry.engine.isState("run") || confirm(Lang.Workspace.will_you_delete_scene) && Entry.scene.removeScene(this.scene);
    });
    e.appendChild(g);
  }
  Entry.Utils.disableContextmenu(c);
  $(c).on("contextmenu", function() {
    var b = [{text:Lang.Workspace.duplicate_scene, enable:Entry.engine.isState("stop") && !this.isMax(), callback:function() {
      Entry.scene.cloneScene(a);
    }}];
    Entry.ContextMenu.show(b, "workspace-contextmenu");
  }.bind(this));
  return a.view = c;
};
Entry.Scene.prototype.updateView = function() {
  if (!Entry.type || "workspace" == Entry.type) {
    for (var a = this.listView_, b = $(a).children().length;b < this.getScenes().length;b++) {
      a.appendChild(this.getScenes()[b].view);
    }
    this.addButton_ && (this.getScenes(), this.isMax() ? this.addButton_.addClass("entryRemove") : this.addButton_.removeClass("entryRemove"));
  }
  this.resize();
};
Entry.Scene.prototype.addScenes = function(a) {
  if ((this.scenes_ = a) && 0 !== a.length) {
    for (var b = 0, c = a.length;b < c;b++) {
      this.generateElement(a[b]);
    }
  } else {
    this.scenes_ = [], this.scenes_.push(this.createScene());
  }
  this.selectScene(this.getScenes()[0]);
  this.updateView();
};
Entry.Scene.prototype.addScene = function(a, b) {
  void 0 === a && (a = this.createScene());
  a.view || this.generateElement(a);
  b || "number" == typeof b ? this.getScenes().splice(b, 0, a) : this.getScenes().push(a);
  Entry.stage.objectContainers.push(Entry.stage.createObjectContainer(a));
  Entry.playground.flushPlayground();
  this.selectScene(a);
  this.updateView();
  return a;
};
Entry.Scene.prototype.removeScene = function(a) {
  if (1 >= this.getScenes().length) {
    Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.Scene_delete_error, !1);
  } else {
    var b = this.getScenes().indexOf(this.getSceneById(a.id));
    this.getScenes().splice(b, 1);
    for (var b = Entry.container.getSceneObjects(a), c = 0;c < b.length;c++) {
      Entry.container.removeObject(b[c]);
    }
    Entry.stage.removeObjectContainer(a);
    $(a.view).remove();
    this.selectScene();
  }
};
Entry.Scene.prototype.selectScene = function(a) {
  a = a || this.getScenes()[0];
  if (!this.selectedScene || this.selectedScene.id != a.id) {
    Entry.engine.isState("run") && Entry.container.resetSceneDuringRun();
    var b = this.selectedScene;
    b && (b = b.view, b.removeClass("selectedScene"), b = $(b), b.find("input").blur());
    this.selectedScene = a;
    a.view.addClass("selectedScene");
    Entry.container.setCurrentObjects();
    Entry.stage.objectContainers && 0 !== Entry.stage.objectContainers.length && Entry.stage.selectObjectContainer(a);
    (a = Entry.container.getCurrentObjects()[0]) && "minimize" != Entry.type ? (Entry.container.selectObject(a.id), Entry.playground.refreshPlayground()) : (Entry.stage.selectObject(null), Entry.playground.flushPlayground(), Entry.variableContainer.updateList());
    Entry.container.listView_ || Entry.stage.sortZorder();
    Entry.container.updateListView();
    this.updateView();
    Entry.requestUpdate = !0;
  }
};
Entry.Scene.prototype.toJSON = function() {
  for (var a = [], b = this.getScenes().length, c = 0;c < b;c++) {
    var d = this.getScenes()[c], e = d.view, f = d.inputWrapper;
    delete d.view;
    delete d.inputWrapper;
    a.push(JSON.parse(JSON.stringify(d)));
    d.view = e;
    d.inputWrapper = f;
  }
  return a;
};
Entry.Scene.prototype.moveScene = function(a, b) {
  this.getScenes().splice(b, 0, this.getScenes().splice(a, 1)[0]);
  Entry.container.updateObjectsOrder();
  Entry.stage.sortZorder();
  $(".entrySceneElementWorkspace").removeAttr("style");
};
Entry.Scene.prototype.getSceneById = function(a) {
  for (var b = this.getScenes(), c = 0;c < b.length;c++) {
    if (b[c].id == a) {
      return b[c];
    }
  }
  return !1;
};
Entry.Scene.prototype.getScenes = function() {
  return this.scenes_;
};
Entry.Scene.prototype.takeStartSceneSnapshot = function() {
  this.sceneBeforeRun = this.selectedScene;
};
Entry.Scene.prototype.loadStartSceneSnapshot = function() {
  this.selectScene(this.sceneBeforeRun);
  this.sceneBeforeRun = null;
};
Entry.Scene.prototype.createScene = function() {
  var a = {name:Lang.Blocks.SCENE + " " + (this.getScenes().length + 1), id:Entry.generateHash()};
  this.generateElement(a);
  return a;
};
Entry.Scene.prototype.cloneScene = function(a) {
  if (this.isMax()) {
    Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.Scene_add_error, !1);
  } else {
    var b = {name:a.name + Lang.Workspace.replica_of_object, id:Entry.generateHash()};
    this.generateElement(b);
    this.addScene(b);
    a = Entry.container.getSceneObjects(a);
    for (var c = a.length - 1;0 <= c;c--) {
      Entry.container.addCloneObject(a[c], b.id);
    }
  }
};
Entry.Scene.prototype.resize = function() {
  var a = this.getScenes(), b = this.selectedScene, c = a[0];
  if (0 !== a.length && c) {
    var d = $(c.view).offset().left, c = parseFloat($(b.view).css("margin-left")), e = $(this.view_).width() - d, f = 0, g;
    for (g in a) {
      var d = a[g], h = d.view;
      h.addClass("minValue");
      $(d.inputWrapper).width(Entry.computeInputWidth(d.name));
      h = $(h);
      f = f + h.width() + c;
    }
    if (f > e) {
      for (g in e -= $(b.view).width(), c = e / (a.length - 1) - (Entry.Scene.viewBasicWidth + c), a) {
        d = a[g], b.id != d.id ? (d.view.removeClass("minValue"), $(d.inputWrapper).width(c)) : d.view.addClass("minValue");
      }
    }
  }
};
Entry.Scene.prototype.getNextScene = function() {
  var a = this.getScenes();
  return a[a.indexOf(this.selectedScene) + 1];
};
Entry.Scene.prototype.isMax = function() {
  return this.scenes_.length >= this.maxCount;
};
Entry.Scene.prototype.clear = function() {
  this.scenes_.map(function(a) {
    Entry.stage.removeObjectContainer(a);
  });
  $(this.listView_).html("");
  this.scenes_ = [];
};
Entry.Script = function(a) {
  this.entity = a;
};
p = Entry.Script.prototype;
p.init = function(a, b, c) {
  Entry.assert("BLOCK" == a.tagName.toUpperCase(), a.tagName);
  this.type = a.getAttribute("type");
  this.id = Number(a.getAttribute("id"));
  a.getElementsByTagName("mutation").length && a.getElementsByTagName("mutation")[0].hasAttribute("hashid") && (this.hashId = a.childNodes[0].getAttribute("hashid"));
  "REPEAT" == this.type.substr(0, 6).toUpperCase() && (this.isRepeat = !0);
  b instanceof Entry.Script && (this.previousScript = b, b.parentScript && (this.parentScript = b.parentScript));
  c instanceof Entry.Script && (this.parentScript = c);
  a = a.childNodes;
  for (b = 0;b < a.length;b++) {
    if (c = a[b], "NEXT" == c.tagName.toUpperCase()) {
      this.nextScript = new Entry.Script(this.entity), this.register && (this.nextScript.register = this.register), this.nextScript.init(a[b].childNodes[0], this);
    } else {
      if ("VALUE" == c.tagName.toUpperCase()) {
        this.values || (this.values = {});
        var d = new Entry.Script(this.entity);
        this.register && (d.register = this.register);
        d.init(c.childNodes[0]);
        this.values[c.getAttribute("name")] = d;
      } else {
        "FIELD" == c.tagName.toUpperCase() ? (this.fields || (this.fields = {}), this.fields[c.getAttribute("name")] = c.textContent) : "STATEMENT" == c.tagName.toUpperCase() && (this.statements || (this.statements = {}), d = new Entry.Script(this.entity), this.register && (d.register = this.register), d.init(c.childNodes[0], null, this), d.key = c.getAttribute("name"), this.statements[c.getAttribute("name")] = d);
      }
    }
  }
};
p.clone = function(a, b) {
  var c = new Entry.Script(a);
  c.id = this.id;
  c.type = this.type;
  c.isRepeat = this.isRepeat;
  if (this.parentScript && !this.previousScript && 2 != b) {
    c.parentScript = this.parentScript.clone(a);
    for (var d = c.parentScript.statements[this.key] = c;d.nextScript;) {
      d = d.nextScript, d.parentScript = c.parentScript;
    }
  }
  this.nextScript && 1 != b && (c.nextScript = this.nextScript.clone(a, 0), c.nextScript.previousScript = this);
  this.previousScript && 0 !== b && (c.previousScript = this.previousScript.clone(a, 1), c.previousScript.previousScript = this);
  if (this.fields) {
    c.fields = {};
    for (var e in this.fields) {
      c.fields[e] = this.fields[e];
    }
  }
  if (this.values) {
    for (e in c.values = {}, this.values) {
      c.values[e] = this.values[e].clone(a);
    }
  }
  if (this.statements) {
    for (e in c.statements = {}, this.statements) {
      for (c.statements[e] = this.statements[e].clone(a, 2), d = c.statements[e], d.parentScript = c;d.nextScript;) {
        d = d.nextScript, d.parentScript = c;
      }
    }
  }
  return c;
};
p.getStatement = function(a) {
  return this.statements[a];
};
p.compute = function() {
};
p.getValue = function(a) {
  return this.values[a].run();
};
p.getNumberValue = function(a) {
  return Number(this.values[a].run());
};
p.getStringValue = function(a) {
  return String(this.values[a].run());
};
p.getBooleanValue = function(a) {
  return this.values[a].run() ? !0 : !1;
};
p.getField = function(a) {
  return this.fields[a];
};
p.getStringField = function(a) {
  return String(this.fields[a]);
};
p.getNumberField = function(a) {
  return Number(this.fields[a]);
};
p.callReturn = function() {
  return this.nextScript ? this.nextScript : this.parentScript ? this.parentScript : null;
};
p.run = function() {
  return Entry.block[this.type](this.entity, this);
};
Entry.Stage = function() {
  this.variables = {};
  this.background = new createjs.Shape;
  this.background.graphics.beginFill("#ffffff").drawRect(-480, -240, 960, 480);
  this.objectContainers = [];
  this.selectedObjectContainer = null;
  this.variableContainer = new createjs.Container;
  this.dialogContainer = new createjs.Container;
  this.selectedObject = null;
  this.isObjectClick = !1;
};
Entry.Stage.prototype.initStage = function(a) {
  this.canvas = new createjs.Stage(a.id);
  this.canvas.x = 320;
  this.canvas.y = 180;
  this.canvas.scaleX = this.canvas.scaleY = 2 / 1.5;
  createjs.Touch.enable(this.canvas);
  this.canvas.enableMouseOver(10);
  this.canvas.mouseMoveOutside = !0;
  this.canvas.addChild(this.background);
  this.canvas.addChild(this.variableContainer);
  this.canvas.addChild(this.dialogContainer);
  this.inputField = null;
  this.initCoordinator();
  this.initHandle();
  this.mouseCoordinate = {x:0, y:0};
  if (Entry.isPhone()) {
    a.ontouchstart = function(b) {
      Entry.dispatchEvent("canvasClick", b);
      Entry.stage.isClick = !0;
    }, a.ontouchend = function(b) {
      Entry.stage.isClick = !1;
      Entry.dispatchEvent("canvasClickCanceled", b);
    };
  } else {
    var b = function(b) {
      Entry.dispatchEvent("canvasClick", b);
      Entry.stage.isClick = !0;
    };
    a.onmousedown = b;
    a.ontouchstart = b;
    b = function(b) {
      Entry.stage.isClick = !1;
      Entry.dispatchEvent("canvasClickCanceled", b);
    };
    a.onmouseup = b;
    a.ontouchend = b;
    $(document).click(function(b) {
      Entry.stage.focused = "entryCanvas" === b.target.id ? !0 : !1;
    });
  }
  Entry.addEventListener("canvasClick", function(b) {
    Entry.stage.isObjectClick = !1;
  });
  Entry.windowResized.attach(this, function() {
    Entry.stage.updateBoundRect();
  });
  $(window).scroll(function() {
    Entry.stage.updateBoundRect();
  });
  b = function(b) {
    b.preventDefault();
    var a = Entry.stage.getBoundRect(), c;
    -1 < Entry.getBrowserType().indexOf("IE") ? (c = 480 * ((b.pageX - a.left - document.documentElement.scrollLeft) / a.width - .5), b = -270 * ((b.pageY - a.top - document.documentElement.scrollTop) / a.height - .5)) : b.changedTouches ? (c = 480 * ((b.changedTouches[0].pageX - a.left - document.body.scrollLeft) / a.width - .5), b = -270 * ((b.changedTouches[0].pageY - a.top - document.body.scrollTop) / a.height - .5)) : (c = 480 * ((b.pageX - a.left - document.body.scrollLeft) / a.width - .5), 
    b = -270 * ((b.pageY - a.top - document.body.scrollTop) / a.height - .5));
    Entry.stage.mouseCoordinate = {x:c.toFixed(1), y:b.toFixed(1)};
    Entry.dispatchEvent("stageMouseMove");
  };
  a.onmousemove = b;
  a.ontouchmove = b;
  a.onmouseout = function(b) {
    Entry.dispatchEvent("stageMouseOut");
  };
  Entry.addEventListener("updateObject", function(b) {
    Entry.engine.isState("stop") && Entry.stage.updateObject();
  });
  Entry.addEventListener("canvasInputComplete", function(b) {
    try {
      var a = Entry.stage.inputField.value();
      Entry.stage.hideInputField();
      if (a) {
        var c = Entry.container;
        c.setInputValue(a);
        c.inputValue.complete = !0;
      }
    } catch (f) {
    }
  });
  this.initWall();
  this.render();
};
Entry.Stage.prototype.render = function() {
  Entry.stage.timer && clearTimeout(Entry.stage.timer);
  var a = (new Date).getTime();
  Entry.stage.update();
  a = (new Date).getTime() - a;
  Entry.stage.timer = setTimeout(Entry.stage.render, 16 - a % 16 + 16 * Math.floor(a / 16));
};
Entry.Stage.prototype.update = function() {
  "invisible" !== Entry.type && (Entry.requestUpdate ? (Entry.engine.isState("stop") && this.objectUpdated ? (this.canvas.update(), this.objectUpdated = !1) : this.canvas.update(), this.inputField && !this.inputField._isHidden && this.inputField.render(), Entry.requestUpdateTwice ? Entry.requestUpdateTwice = !1 : Entry.requestUpdate = !1) : Entry.requestUpdate = !1);
};
Entry.Stage.prototype.loadObject = function(a) {
  var b = a.entity.object;
  this.getObjectContainerByScene(a.scene).addChild(b);
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.loadEntity = function(a) {
  Entry.stage.getObjectContainerByScene(a.parent.scene).addChild(a.object);
  this.sortZorder();
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.unloadEntity = function(a) {
  Entry.stage.getObjectContainerByScene(a.parent.scene).removeChild(a.object);
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.loadVariable = function(a) {
  var b = a.view_;
  this.variables[a.id] = b;
  this.variableContainer.addChild(b);
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.removeVariable = function(a) {
  this.variableContainer.removeChild(a.view_);
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.loadDialog = function(a) {
  this.dialogContainer.addChild(a.object);
};
Entry.Stage.prototype.unloadDialog = function(a) {
  this.dialogContainer.removeChild(a.object);
};
Entry.Stage.prototype.sortZorder = function() {
  for (var a = Entry.container.getCurrentObjects(), b = this.selectedObjectContainer, c = 0, d = a.length - 1;0 <= d;d--) {
    for (var e = a[d], f = e.entity, e = e.clonedEntities, g = 0, h = e.length;g < h;g++) {
      e[g].shape && b.setChildIndex(e[g].shape, c++), b.setChildIndex(e[g].object, c++);
    }
    f.shape && b.setChildIndex(f.shape, c++);
    b.setChildIndex(f.object, c++);
  }
};
Entry.Stage.prototype.initCoordinator = function() {
  var a = new createjs.Container, b = new createjs.Bitmap(Entry.mediaFilePath + "workspace_coordinate.png");
  b.scaleX = .5;
  b.scaleY = .5;
  b.x = -240;
  b.y = -135;
  a.addChild(b);
  this.canvas.addChild(a);
  a.visible = !1;
  this.coordinator = a;
};
Entry.Stage.prototype.toggleCoordinator = function() {
  this.coordinator.visible = !this.coordinator.visible;
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.selectObject = function(a) {
  this.selectedObject = a ? a : null;
  this.updateObject();
};
Entry.Stage.prototype.initHandle = function() {
  this.handle = new EaselHandle(this.canvas);
  this.handle.setChangeListener(this, this.updateHandle);
  this.handle.setEditStartListener(this, this.startEdit);
  this.handle.setEditEndListener(this, this.endEdit);
};
Entry.Stage.prototype.updateObject = function() {
  if ("invisible" !== Entry.type && (Entry.requestUpdate = !0, this.handle.setDraggable(!0), !this.editEntity)) {
    var a = this.selectedObject;
    if (a) {
      "textBox" == a.objectType ? this.handle.toggleCenter(!1) : this.handle.toggleCenter(!0);
      "free" == a.getRotateMethod() ? this.handle.toggleRotation(!0) : this.handle.toggleRotation(!1);
      this.handle.toggleDirection(!0);
      a.getLock() ? (this.handle.toggleRotation(!1), this.handle.toggleDirection(!1), this.handle.toggleResize(!1), this.handle.toggleCenter(!1), this.handle.setDraggable(!1)) : this.handle.toggleResize(!0);
      this.handle.setVisible(!0);
      var b = a.entity;
      this.handle.setWidth(b.getScaleX() * b.getWidth());
      this.handle.setHeight(b.getScaleY() * b.getHeight());
      var c, d;
      if ("textBox" == b.type) {
        if (b.getLineBreak()) {
          c = b.regX * b.scaleX, d = -b.regY * b.scaleY;
        } else {
          var e = b.getTextAlign();
          d = -b.regY * b.scaleY;
          switch(e) {
            case Entry.TEXT_ALIGN_LEFT:
              c = -b.getWidth() / 2 * b.scaleX;
              break;
            case Entry.TEXT_ALIGN_CENTER:
              c = b.regX * b.scaleX;
              break;
            case Entry.TEXT_ALIGN_RIGHT:
              c = b.getWidth() / 2 * b.scaleX;
          }
        }
      } else {
        c = (b.regX - b.width / 2) * b.scaleX, d = (b.height / 2 - b.regY) * b.scaleY;
      }
      e = b.getRotation() / 180 * Math.PI;
      this.handle.setX(b.getX() - c * Math.cos(e) - d * Math.sin(e));
      this.handle.setY(-b.getY() - c * Math.sin(e) + d * Math.cos(e));
      this.handle.setRegX((b.regX - b.width / 2) * b.scaleX);
      this.handle.setRegY((b.regY - b.height / 2) * b.scaleY);
      this.handle.setRotation(b.getRotation());
      this.handle.setDirection(b.getDirection());
      this.objectUpdated = !0;
      this.handle.setVisible(a.entity.getVisible());
      a.entity.getVisible() && this.handle.render();
    } else {
      this.handle.setVisible(!1);
    }
  }
};
Entry.Stage.prototype.updateHandle = function() {
  this.editEntity = !0;
  var a = this.handle, b = this.selectedObject.entity;
  if (b.lineBreak) {
    b.setHeight(a.height / b.getScaleY()), b.setWidth(a.width / b.getScaleX());
  } else {
    if (0 !== b.width) {
      var c = Math.abs(a.width / b.width);
      b.flip && (c *= -1);
      b.setScaleX(c);
    }
    0 !== b.height && b.setScaleY(a.height / b.height);
  }
  c = a.rotation / 180 * Math.PI;
  if ("textBox" == b.type) {
    var d;
    if (b.getLineBreak()) {
      b.setX(a.x), b.setY(-a.y);
    } else {
      switch(b.getTextAlign()) {
        case Entry.TEXT_ALIGN_LEFT:
          b.setX(a.x - a.width / 2 * Math.cos(c));
          b.setY(-a.y + a.width / 2 * Math.sin(c));
          break;
        case Entry.TEXT_ALIGN_CENTER:
          b.setX(a.x);
          b.setY(-a.y);
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          b.setX(a.x + a.width / 2 * Math.cos(c)), b.setY(-a.y - a.width / 2 * Math.sin(c));
      }
    }
  } else {
    d = b.width / 2 + a.regX / b.scaleX, b.setX(a.x + a.regX * Math.cos(c) - a.regY * Math.sin(c)), b.setRegX(d), d = b.height / 2 + a.regY / b.scaleY, b.setY(-a.y - a.regX * Math.sin(c) - a.regY * Math.cos(c)), b.setRegY(d);
  }
  b.setDirection(a.direction);
  b.setRotation(a.rotation);
  this.selectedObject.entity.doCommand();
  this.editEntity = !1;
};
Entry.Stage.prototype.startEdit = function() {
  this.selectedObject.entity.initCommand();
};
Entry.Stage.prototype.endEdit = function() {
  this.selectedObject.entity.checkCommand();
};
Entry.Stage.prototype.initWall = function() {
  var a = new createjs.Container, b = new Image;
  b.src = Entry.mediaFilePath + "media/bound.png";
  a.up = new createjs.Bitmap;
  a.up.scaleX = 16;
  a.up.y = -165;
  a.up.x = -240;
  a.up.image = b;
  a.addChild(a.up);
  a.down = new createjs.Bitmap;
  a.down.scaleX = 16;
  a.down.y = 135;
  a.down.x = -240;
  a.down.image = b;
  a.addChild(a.down);
  a.right = new createjs.Bitmap;
  a.right.scaleY = 9;
  a.right.y = -135;
  a.right.x = 240;
  a.right.image = b;
  a.addChild(a.right);
  a.left = new createjs.Bitmap;
  a.left.scaleY = 9;
  a.left.y = -135;
  a.left.x = -270;
  a.left.image = b;
  a.addChild(a.left);
  this.canvas.addChild(a);
  this.wall = a;
};
Entry.Stage.prototype.showInputField = function(a) {
  a = 1 / 1.5;
  this.inputField || (this.inputField = new CanvasInput({canvas:document.getElementById("entryCanvas"), fontSize:30 * a, fontFamily:"NanumGothic", fontColor:"#212121", width:556 * a, height:26 * a, padding:8 * a, borderWidth:1 * a, borderColor:"#000", borderRadius:3 * a, boxShadow:"none", innerShadow:"0px 0px 5px rgba(0, 0, 0, 0.5)", x:202 * a, y:450 * a, topPosition:!0, onsubmit:function() {
    Entry.dispatchEvent("canvasInputComplete");
  }}));
  a = new createjs.Container;
  var b = new Image;
  b.src = Entry.mediaFilePath + "confirm_button.png";
  var c = new createjs.Bitmap;
  c.scaleX = .23;
  c.scaleY = .23;
  c.x = 160;
  c.y = 89;
  c.cursor = "pointer";
  c.image = b;
  a.addChild(c);
  a.on("mousedown", function(b) {
    Entry.dispatchEvent("canvasInputComplete");
  });
  this.inputSubmitButton || (this.inputField.value(""), this.canvas.addChild(a), this.inputSubmitButton = a);
  this.inputField.show();
  Entry.requestUpdateTwice = !0;
};
Entry.Stage.prototype.hideInputField = function() {
  this.inputField && this.inputField.value() && this.inputField.value("");
  this.inputSubmitButton && (this.canvas.removeChild(this.inputSubmitButton), this.inputSubmitButton = null);
  this.inputField && this.inputField.hide();
  Entry.requestUpdate = !0;
};
Entry.Stage.prototype.initObjectContainers = function() {
  var a = Entry.scene.scenes_;
  if (a && 0 !== a.length) {
    for (var b = 0;b < a.length;b++) {
      this.objectContainers[b] = this.createObjectContainer(a[b]);
    }
    this.selectedObjectContainer = this.objectContainers[0];
  } else {
    a = this.createObjectContainer(Entry.scene.selectedScene), this.objectContainers.push(a), this.selectedObjectContainer = a;
  }
  "invisible" !== Entry.type && this.canvas.addChild(this.selectedObjectContainer);
  this.selectObjectContainer(Entry.scene.selectedScene);
};
Entry.Stage.prototype.selectObjectContainer = function(a) {
  if (this.canvas) {
    for (var b = this.objectContainers, c = 0;c < b.length;c++) {
      this.canvas.removeChild(b[c]);
    }
    this.selectedObjectContainer = this.getObjectContainerByScene(a);
    this.canvas.addChildAt(this.selectedObjectContainer, 2);
  }
};
Entry.Stage.prototype.reAttachToCanvas = function() {
  for (var a = [this.selectedObjectContainer, this.variableContainer, this.coordinator, this.handle, this.dialogContainer], b = 0;b < a.length;b++) {
    this.canvas.removeChild(a[b]), this.canvas.addChild(a[b]);
  }
  console.log(this.canvas.getChildIndex(this.selectedObjectContainer));
};
Entry.Stage.prototype.createObjectContainer = function(a) {
  var b = new createjs.Container;
  b.scene = a;
  return b;
};
Entry.Stage.prototype.removeObjectContainer = function(a) {
  var b = this.objectContainers;
  a = this.getObjectContainerByScene(a);
  this.canvas.removeChild(a);
  b.splice(this.objectContainers.indexOf(a), 1);
};
Entry.Stage.prototype.getObjectContainerByScene = function(a) {
  for (var b = this.objectContainers, c = 0;c < b.length;c++) {
    if (b[c].scene.id == a.id) {
      return b[c];
    }
  }
};
Entry.Stage.prototype.moveSprite = function(a) {
  if (this.selectedObject && Entry.stage.focused && !this.selectedObject.getLock()) {
    var b = 5;
    a.shiftKey && (b = 1);
    var c = this.selectedObject.entity;
    switch(a.keyCode) {
      case 38:
        c.setY(c.getY() + b);
        break;
      case 40:
        c.setY(c.getY() - b);
        break;
      case 37:
        c.setX(c.getX() - b);
        break;
      case 39:
        c.setX(c.getX() + b);
    }
    this.updateObject();
  }
};
Entry.Stage.prototype.getBoundRect = function(a) {
  return this._boundRect ? this._boundRect : this.updateBoundRect();
};
Entry.Stage.prototype.updateBoundRect = function(a) {
  return this._boundRect = this.canvas.canvas.getBoundingClientRect();
};
Entry.StampEntity = function(a, b) {
  this.parent = a;
  this.type = a.objectType;
  this.isStamp = this.isClone = !0;
  this.width = b.getWidth();
  this.height = b.getHeight();
  "sprite" == this.type && (this.object = b.object.clone(!0), this.object.filters = null, b.effect && (this.effect = Entry.cloneSimpleObject(b.effect), this.applyFilter()));
  this.object.entity = this;
};
(function(a, b) {
  a.applyFilter = b.applyFilter;
  a.removeClone = b.removeClone;
  a.getWidth = b.getWidth;
  a.getHeight = b.getHeight;
  a.getInitialEffectValue = b.getInitialEffectValue;
})(Entry.StampEntity.prototype, Entry.EntityObject.prototype);
Entry.JsAstGenerator = function() {
};
(function(a) {
  a.generate = function(b) {
    return arcon.parse(b);
  };
})(Entry.JsAstGenerator.prototype);
Entry.PyAstGenerator = function() {
};
(function(a) {
  a.generate = function(b) {
    var a = filbert.parse, d = {locations:!1, ranges:!1}, e;
    try {
      return e = a(b, d), console.log("astTree", e), e;
    } catch (f) {
      throw f.message = "  \ud30c\uc774\uc36c \ubb38\ubc95\uc744 \ud655\uc778\ud574\uc8fc\uc138\uc694", f;
    }
  };
})(Entry.PyAstGenerator.prototype);
Entry.Map = function() {
  this._map = {repo:{}};
};
(function(a) {
  a.getKey = function(b) {
    return b;
  };
  a.put = function(b, a) {
    b = this.getKey(b);
    this._map.repo[b] = a;
  };
  a.contains = function(b) {
    b = this.getKey(b);
    return this._map.repo[b] ? !0 : !1;
  };
  a.get = function(b) {
    b = this.getKey(b);
    return this._map.repo[b] ? this._map.repo[b] : null;
  };
  a.remove = function(b) {
    var a = this.getKey(b);
    this.contains(b) && (this._map.repo[a] = void 0);
  };
  a.clear = function() {
    this._map.repo = {};
  };
  a.toString = function() {
    return this._map.repo;
  };
})(Entry.Map.prototype);
Entry.Queue = function() {
  this.tail = this.head = null;
};
function Node(a) {
  this.data = a;
  this.next = null;
}
(function(a) {
  a.enqueue = function(b) {
    b = new Node(b);
    null === this.head ? this.head = b : this.tail.next = b;
    this.tail = b;
  };
  a.dequeue = function() {
    var b;
    null !== this.head && (b = this.head.data, this.head = this.head.next);
    return b;
  };
  a.clear = function() {
    for (;this.dequeue();) {
    }
  };
  a.toString = function() {
    for (var b = this.head, a = [];b;) {
      a.push(b.data), b = b.next;
    }
    return a.toString();
  };
})(Entry.Queue.prototype);
Entry.PyHint = function() {
  function a(b, a, c) {
    b = fuzzy.filter(a, b, c);
    return b = b.map(function(b) {
      return b.original;
    });
  }
  CodeMirror.registerHelper("hint", "python", function(d) {
    var e = d.getCursor(), f = d.getTokenAt(e);
    /^[\w$_]*$/.test(f.string) || (f = {start:e.ch, end:e.ch, string:"", state:f.state, className:":" == f.string ? "python-type" : null});
    var g = [], h = f.string, k;
    if ("variable" == f.type) {
      k = f.string, null != k && (g = g.concat(a(b, h)), g = g.concat(a(c._global, h, {extract:function(b) {
        return b.displayText;
      }})));
    } else {
      if ("property" == f.type || "variable-2" == f.type || "." == f.state.lastToken) {
        k = f.string;
        d = d.getLineTokens(e.line);
        for (var t = d.shift();"variable" !== t.type && "variable-2" !== t.type;) {
          t = d.shift();
        }
        d = t.string;
        null != k && c[d] && (g = g.concat(a(c[d], h, {extract:function(b) {
          return b.displayText;
        }})));
        "." == f.state.lastToken && (g = g.concat(c[d]));
      }
    }
    return {list:g.slice(0, 25), from:CodeMirror.Pos(e.line, f.start), to:CodeMirror.Pos(e.line, f.end)};
  });
  var b = "Entry;self;Hw;while True;True;False;break;for i in range;if;if else;len;random.randint".split(";"), c = {_global:[]}, d = Entry.block, e;
  for (e in d) {
    var f = d[e].syntax;
    if (f && f.py) {
      f = f.py.join("");
      f = f.split(".");
      if (-1 < f[0].indexOf("def ")) {
        f = f[0].split(" ");
      } else {
        if (1 === f.length) {
          continue;
        }
      }
      var g = f.shift();
      c[g] || (c[g] = [], c._global.push({displayText:g, text:g}));
      var f = f[0].split(","), h = "(" + Array(f.length).join(" , ") + ")", f = f[0].split("(")[0];
      c[g].push({displayText:f, text:f + h});
      "def" == g ? c._global.push({displayText:g + " " + f, text:g + " " + f + h}) : c._global.push({displayText:g + "." + f, text:g + "." + f + h});
    }
  }
};
Entry.TextCodingUtil = function() {
};
(function(a) {
  a._funcParamQ;
  a.initQueue = function() {
    this._funcParamQ = new Entry.Queue;
    this._funcNameQ = new Entry.Queue;
  };
  a.clearQueue = function() {
    this._funcParamQ.clear();
    this._funcNameQ.clear();
  };
  a.indent = function(b) {
    var a = "\t";
    b = b.split("\n");
    b.pop();
    a += b.join("\n\t");
    return a = "\t" + a.trim();
  };
  a.isNumeric = function(b) {
    return b.match(/^-?\d+$|^-\d+$/) || b.match(/^-?\d+\.\d+$/) ? !0 : !1;
  };
  a.isBinaryOperator = function(b) {
    return "==" == b || ">" == b || "<" == b || ">=" == b || "<=" == b || "+" == b || "-" == b || "*" == b || "/" == b ? !0 : !1;
  };
  a.binaryOperatorConvert = function(b) {
    switch(b) {
      case "==":
        b = "EQUAL";
        break;
      case ">":
        b = "GREATER";
        break;
      case "<":
        b = "LESS";
        break;
      case ">=":
        b = "GREATER_OR_EQUAL";
        break;
      case "<=":
        b = "LESS_OR_EQUAL";
        break;
      case "+":
        b = "PLUS";
        break;
      case "-":
        b = "MINUS";
        break;
      case "*":
        b = "MULTIFLY";
        break;
      case "/":
        b = "DIVIDE";
    }
    return b;
  };
  a.logicalExpressionConvert = function(b) {
    switch(b) {
      case "&&":
        b = null;
        break;
      case "||":
        b = null;
    }
    return b;
  };
  a.dropdownDynamicValueConvertor = function(b, a) {
    var c = a.options, e;
    for (e in c) {
      var f = c[e];
      if ("null" == f[1]) {
        return c = {};
      }
      if ("mouse" == b || "wall" == b || "wall_up" == b || "wall_down" == b || "wall_right" == b || "wall_left" == b) {
        return b;
      }
      if (b == f[1]) {
        return console.log("dropdownDynamicValueConvertor value", b, f[1]), c = f[0];
      }
    }
    c = b;
    if ("variables" == a.menuName) {
      var g = Entry.variableContainer.variables_, h;
      for (h in g) {
        var k = g[h];
        if (k.id_ == b) {
          c = k.name_;
          break;
        }
      }
    } else {
      if ("lists" == a.menuName) {
        for (h in g = Entry.variableContainer.lists, g) {
          if (k = g[h], k.id_ == b) {
            c = k.name_;
            break;
          }
        }
      } else {
        if ("pictures" == a.menuName) {
          for (g in h = Entry.container.getAllObjects(), h) {
            for (k in a = h[g], a = a.pictures, a) {
              if (e = a[k], e.id == b) {
                return c = e.name;
              }
            }
          }
        } else {
          if ("sounds" == a.menuName) {
            for (g in h = Entry.container.getAllObjects(), h) {
              for (k in a = h[g], a = a.sounds, a) {
                if (e = a[k], e.id == b) {
                  return c = e.name;
                }
              }
            }
          }
        }
      }
    }
    return c;
  };
  a.binaryOperatorValueConvertor = function(b) {
    switch(b) {
      case "EQUAL":
        b = "==";
        break;
      case "GREATER":
        b = ">";
        break;
      case "LESS":
        b = "<";
        break;
      case "GREATER_OR_EQUAL":
        b = ">=";
        break;
      case "LESS_OR_EQUAL":
        b = "<=";
        break;
      case "\uadf8\ub9ac\uace0":
        b = "&&";
        break;
      case "\ub610\ub294":
        b = "||";
        break;
      case "PLUS":
        b = "+";
        break;
      case "MINUS":
        b = "-";
        break;
      case "MULTI":
        b = "*";
        break;
      case "DIVIDE":
        b = "/";
    }
    return b;
  };
  a.variableFilter = function(b, a, d) {
    var c = d;
    b = b.data.type;
    "change_variable" == b || "set_variable" == b || "get_variable" == b ? 1 == a && (c = eval(d)) : "length_of_list" == b || "is_included_in_list" == b ? 2 == a && (c = eval(d)) : "value_of_index_from_list" == b ? 2 == a ? c = eval(d) : 4 == a && this.isNumeric(d) && (c = d - 1) : "remove_value_from_list" == b ? 2 == a ? c = eval(d) : 1 == a && this.isNumeric(d) && (c = d - 1) : "insert_value_to_list" == b ? 2 == a ? c = eval(d) : 3 == a && this.isNumeric(d) && (c = d - 1) : "change_value_list_index" == 
    b ? 1 == a ? c = eval(d) : 2 == a && this.isNumeric(d) && (c = d - 1) : "add_value_to_list" == b && 2 == a && (c = eval(d));
    return c;
  };
  a.isGlobalVariableExisted = function(b) {
    var a = Entry.variableContainer.variables_, d;
    for (d in a) {
      var e = a[d];
      if (null === e.object_ && e.name_ == b) {
        return !0;
      }
    }
    return !1;
  };
  a.updateGlobalVariable = function(b, a) {
    var c = Entry.variableContainer.variables_, e;
    for (e in c) {
      var f = c[e];
      if (null === f.object_ && f.name_ == b) {
        variable = {x:f.x_, y:f.y_, id:f.id_, visible:f.visible_, value:a, name:b, isCloud:f.isClud_};
        f.syncModel_(variable);
        Entry.variableContainer.updateList();
        break;
      }
    }
  };
  a.createGlobalVariable = function(b, a) {
    this.isGlobalVariableExisted(b) || (Entry.variableContainer.addVariable({name:b, value:a, variableType:"variable"}), Entry.variableContainer.updateList());
  };
  a.isLocalVariableExisted = function(b, a) {
    var c = Entry.variableContainer.variables_, e;
    for (e in c) {
      var f = c[e];
      if (f.object_ === a.id && f.name_ == b) {
        return !0;
      }
    }
    return !1;
  };
  a.updateLocalVariable = function(b, a, d) {
    var c = Entry.variableContainer.variables_, f;
    for (f in c) {
      var g = c[f];
      if (g.object_ === d.id && g.name_ == b) {
        g.syncModel_({x:g.x_, y:g.y_, id:g.id_, visible:g.visible_, value:a, name:b, isCloud:g.isClud_});
        Entry.variableContainer.updateList();
        break;
      }
    }
  };
  a.createLocalVariable = function(b, a, d) {
    this.isLocalVariableExisted(b, d) || (Entry.variableContainer.addVariable({name:b, value:a, object:d.id, variableType:"variable"}), Entry.variableContainer.updateList());
  };
  a.isLocalVariable = function(b) {
    var a = Entry.playground.object, d = Entry.variableContainer.variables_, e;
    for (e in d) {
      var f = d[e];
      if (f.object_ == a.id && f.id_ == b) {
        return !0;
      }
    }
    return !1;
  };
  a.isGlobalListExisted = function(b) {
    var a = Entry.variableContainer.lists_, d;
    for (d in a) {
      var e = a[d];
      if (null === e.object_ && e.name_ == b) {
        return !0;
      }
    }
    return !1;
  };
  a.updateGlobalList = function(b, a) {
    var c = Entry.variableContainer.lists_, e;
    for (e in c) {
      var f = c[e];
      if (null === f.object_ && f.name_ == b) {
        list = {x:f.x_, y:f.y_, id:f.id_, visible:f.visible_, name:b, isCloud:f.isClud_, width:f.width_, height:f.height_, array:a};
        f.syncModel_(list);
        f.updateView();
        Entry.variableContainer.updateList();
        break;
      }
    }
  };
  a.createGlobalList = function(b, a) {
    this.isGlobalListExisted(b) || (Entry.variableContainer.addList({name:b, array:a, variableType:"list"}), Entry.variableContainer.updateList());
  };
  a.isLocalListExisted = function(b, a) {
    var c = Entry.variableContainer.lists_, e;
    for (e in c) {
      var f = c[e];
      if (f.object_ === a.id && f.name_ == b) {
        return !0;
      }
    }
    return !1;
  };
  a.updateLocalList = function(b, a, d) {
    var c = Entry.variableContainer.lists_, f;
    for (f in c) {
      var g = c[f];
      if (g.object_ === d.id && g.name_ == b) {
        g.syncModel_({x:g.x_, y:g.y_, id:g.id_, visible:g.visible_, name:b, isCloud:g.isClud_, width:g.width_, height:g.height_, array:a});
        g.updateView();
        Entry.variableContainer.updateList();
        break;
      }
    }
  };
  a.createLocalList = function(b, a, d) {
    this.isLocalListExisted(b, d) || (Entry.variableContainer.addList({name:b, array:a, object:d.id, variableType:"list"}), Entry.variableContainer.updateList());
  };
  a.isLocalList = function(b) {
    var a = Entry.playground.object, d = Entry.variableContainer.lists_, e;
    for (e in d) {
      var f = d[e];
      if (f.object_ == a.id && f.id_ == b) {
        return !0;
      }
    }
    return !1;
  };
  a.isLocalType = function(b, a) {
    if ("get_variable" == b.data.type || "set_variable" == b.data.type || "change_variable" == b.data.type) {
      if (this.isLocalVariable(a)) {
        return !0;
      }
    } else {
      if (("value_of_index_from_list" == b.data.type || "add_value_to_list" == b.data.type || "remove_value_from_list" == b.data.type || "insert_value_to_list" == b.data.type || "change_value_list_index" == b.data.type || "length_of_list" == b.data.type || "is_included_in_list" == b.data.type) && this.isLocalList(a)) {
        return !0;
      }
    }
  };
  a.isEventBlock = function(b) {
    b = b.data.type;
    return "when_run_button_click" == b || "when_some_key_pressed" == b || "mouse_clicked" == b || "mouse_click_cancled" == b || "when_object_click" == b || "when_object_click_canceled" == b || "when_message_cast" == b || "when_scene_start" == b || "when_clone_start" == b ? !0 : !1;
  };
  a.makeDefinition = function(b) {
    var a = /(%.)/mi;
    b = Entry.block[b.data.type].syntax.py[0].split(a);
    for (var d = "", e = 0;e < b.length;e++) {
      var f = b[e], d = a.test(f) ? d + "event" : d + f;
    }
    return d;
  };
  a.isNoPrintBlock = function(b) {
    return !1;
  };
  a.entryEventFuncFilter = function(b) {
    var a = !1;
    b = b.split("\n");
    for (var d in b) {
      var e = b[d];
      "def entry_event_start():" == e || "def entry_event_mouse_down():" == e || "def entry_event_mouse_up():" == e || "def entry_event_object_down():" == e || "def entry_event_scene_start():" == e || "def entry_event_clone_create():" == e ? (tokens = e.split("def"), e = tokens[1].substring(0, tokens[1].length - 1).trim() + "\n", b[d] = e, a = !0) : (new RegExp(/^def entry_event_key(.+):$/)).test(e) || (new RegExp(/^def entry_event_signal(.+):$/)).test(e) ? (tokens = e.split("def"), e = tokens[1].substring(0, 
      tokens[1].length - 1).trim() + "\n", b[d] = e, a = !0) : a && (e = b[d], e = e.replace("\t", ""), b[d] = e);
    }
    return b.join("\n");
  };
  a.eventBlockSyntaxFilter = function(b) {
    return "entry_event_start" == b || "entry_event_key" == b || "entry_event_mouse_down" == b || "entry_event_mouse_up" == b || "entry_event_object_down" == b || "entry_event_signal" == b || "entry_event_scene_start" == b || "entry_event_clone_create" == b ? "def " + b : b;
  };
  a.isEntryEventFunc = function(b) {
    return "def entry_event_start" == b || "def entry_event_key" == b || "def entry_event_mouse_down" == b || "def entry_event_mouse_up" == b || "def entry_event_object_down" == b || "def entry_event_signal" == b || "def entry_event_scene_start" == b || "def entry_event_clone_create" == b ? !0 : !1;
  };
  a.searchFuncDefParam = function(b) {
    "function_field_label" == b.data.type && this._funcNameQ.enqueue(b.data.params[0]);
    return b && b.data && b.data.params && b.data.params[1] ? ("function_field_string" != b.data.type && "function_field_boolean" != b.data.type || this._funcParamQ.enqueue(b.data.params[0].data.type), this.searchFuncDefParam(b.data.params[1])) : b;
  };
  a.gatherFuncDefParam = function(b) {
    if (b && b.data) {
      if (b.data.params[0]) {
        if (b.data.params[0].data) {
          var a = b.data.params[0].data.type;
          "function_field_string" != b.data.type && "function_field_boolean" != b.data.type || this._funcParamQ.enqueue(a);
        } else {
          "function_field_label" == b.data.type && this._funcNameQ.enqueue(b.data.params[0]);
        }
      }
      if (b.data.params[1]) {
        var d = this.searchFuncDefParam(b.data.params[1]);
        d.data.params[0].data && (a = d.data.params[0].data.type, "function_field_string" != d.data.type && "function_field_boolean" != d.data.type || this._funcParamQ.enqueue(a));
        d.data.params[1] && d.data.params[1].data.params[0].data && (a = d.data.params[1].data.params[0].data.type, "function_field_string" != d.data.params[1].data.type && "function_field_boolean" != d.data.params[1].data.type || this._funcParamQ.enqueue(a));
      }
    }
    return d;
  };
  a.getLastParam = function(b) {
    b && b.data && b.data.params[1] && (b = this.getLastParam(b.data.params[1]));
    return b;
  };
  a.isFuncContentsMatch = function(b, a, d) {
    for (var c = !0, f = 0;f < b.length && c;f++) {
      var c = !1, g = b[f], h = a[f];
      if (g && !h) {
        c = fasle;
        break;
      }
      if (!g && h) {
        c = !1;
        break;
      }
      if (h.type == g.data.type) {
        var c = !0, k = h.params, m = g.data.params, l = [];
        m.map(function(b, a) {
          b && l.push(b);
        });
        m = l;
        if (k.length == m.length) {
          for (var c = !0, n = 0;n < k.length && c;n++) {
            if (c = !1, k[n].name) {
              for (var q in textFuncParams) {
                if (k[n].name == textFuncParams[q]) {
                  for (var r in d) {
                    if (m[n].data.type == r && d[r] == q) {
                      c = !0;
                      break;
                    }
                  }
                  if (c) {
                    break;
                  }
                }
              }
            } else {
              "True" == k[n].type || "False" == k[n].type ? k[n].type == m[n].data.type && (c = !0) : k[n].type && k[n].params && k[n].params[0] == m[n].data.params[0] && (c = !0);
            }
          }
          c && h.statements && 0 != h.statements.length && (c = this.isFuncContentsMatch(g.data.statements[0]._data, h.statements[0]));
        } else {
          c = !1;
          break;
        }
      } else {
        c = !1;
        break;
      }
    }
    return c;
  };
  a.isParamBlock = function(b) {
    b = b.type;
    return "ai_boolean_distance" == b || "ai_distance_value" == b || "ai_boolean_object" == b || "ai_boolean_and" == b ? !0 : !1;
  };
  a.hasBlockInfo = function(b, a) {
    var c = !1, e;
    for (e in a) {
      var f = a[e];
      if (e == b.type) {
        for (var g in f) {
          var h = f[g];
          if (h.start == b.start && h.end == b.end) {
            c = !0;
            break;
          }
        }
      }
    }
    return c;
  };
  a.updateBlockInfo = function(b, a) {
    var c = a[b.type];
    if (c && Array.isArray(c) && 0 != c.legnth) {
      for (var e in c) {
        if (a = c[e], a.start == b.start && a.end == b.end) {
          break;
        } else {
          var f = {};
          f.start = b.start;
          f.end = b.end;
          c.push(f);
        }
      }
    } else {
      a[b.type] = [], f = {}, f.start = b.start, f.end = b.end, a[b.type].push(f);
    }
  };
  a.jsAdjustSyntax = function(b, a) {
    if ("ai_boolean_distance" == b.data.type) {
      var c = a.split(" ");
      b = c[0].split("_");
      b[1] = b[1].substring(1, b[1].length - 1);
      b[1] = b[1].toLowerCase();
      b = b.join("_");
      a = c[1];
      a = this.bTojBinaryOperatorConvertor(a);
      c = c[2];
      b = b + " " + a + " " + c;
    } else {
      "ai_boolean_object" == b.data.type ? (c = a.split(" "), b = c[0].split("_"), b[1] = b[1].substring(1, b[1].length - 1), b[1] = b[1].toLowerCase(), b = b.join("_"), a = c[1], c = c[2], b = b + " " + a + " " + c) : "ai_distance_value" == b.data.type ? (c = a.split(" "), b = c[0].split("_"), b[1] = b[1].substring(1, b[1].length - 1), b[1] = b[1].toLowerCase(), b = b.join("_")) : b = a;
    }
    return b;
  };
  a.bTojBinaryOperatorConvertor = function(b) {
    var a;
    switch(b) {
      case "'BIGGER'":
        a = ">";
        break;
      case "'BIGGER_EQUAL'":
        a = ">=";
        break;
      case "'EQUAL'":
        a = "==";
        break;
      case "'SMALLER'":
        a = "<";
        break;
      case "'SMALLER_EQUAL'":
        a = "<=";
    }
    return a;
  };
  a.jTobBinaryOperatorConvertor = function(b) {
    var a;
    switch(b) {
      case ">":
        a = "BIGGER";
        break;
      case ">=":
        a = "BIGGER_EQUAL";
        break;
      case "==":
        a = "EQUAL";
        break;
      case "<":
        a = "SMALLER";
        break;
      case "<=":
        a = "SMALLER_EQUAL";
    }
    return a;
  };
  a.radarVariableConvertor = function(b) {
    return b.split("_")[1].toUpperCase();
  };
  a.tTobDropdownValueConvertor = function(b) {
    return "stone" == b ? "OBSTACLE" : "wall" == b ? b.toUpperCase() : "item" == b ? b.toUpperCase() : b;
  };
})(Entry.TextCodingUtil.prototype);
Entry.BlockToJsParser = function(a) {
  this.syntax = a;
  this._iterVariableCount = 0;
  this._iterVariableChunk = ["i", "j", "k"];
};
(function(a) {
  a.Code = function(b, a) {
    this._parseMode = a;
    if (b instanceof Entry.Block) {
      return this.Block(b);
    }
    a = "";
    b = b._data;
    for (var c = 0;c < b.length;c++) {
      a += this.Thread(b[c]);
    }
    return a.trim();
  };
  a.Thread = function(b) {
    if (b instanceof Entry.Block) {
      return this.Block(b);
    }
    var a = "";
    b = b.getBlocks();
    for (var d = 0;d < b.length;d++) {
      var e = b[d];
      d != b.length - 1 ? (e = this.Block(e), this._parseMode == Entry.Parser.PARSE_GENERAL ? a += e + "\n" : this._parseMode == Entry.Parser.PARSE_SYNTAX && (a = e + "\n")) : (e = this.Block(e), this._parseMode == Entry.Parser.PARSE_GENERAL ? a += e : this._parseMode == Entry.Parser.PARSE_SYNTAX && (a = e));
    }
    return a + "\n";
  };
  a.Block = function(b) {
    var a = b._schema.syntax.js ? b._schema.syntax.js : b._schema.syntax;
    return a ? b = this[a[0]](b) : "";
  };
  a.Program = function(b) {
    return "";
  };
  a.Scope = function(b) {
    var a = !1, d = "", e = /(%.)/mi;
    if (b._schema.syntax.js) {
      var f = b._schema.syntax.js.concat(), a = !0;
    } else {
      f = b._schema.syntax.concat();
    }
    f.shift();
    for (var f = f[0].split(e), g = b._schema.params, h = b.data.params, k = 0;k < f.length;k++) {
      var m = f[k];
      0 !== m.length && "Scope" !== m && ("Judge" === m ? a = !0 : e.test(m) ? (m = m.split("%")[1], m = parseInt(m) - 1, g[m] && "Image" != g[m].type && ("Block" == g[m].type ? (m = this.Block(h[m]), d += m) : d += this[g[m].type](h[m], g[m]))) : d += m);
    }
    "#" == d.charAt(d.length - 1) && (a = !0, d = d.substring(0, d.length - 1), d = d.trim());
    a || (d += "();");
    return d = Entry.TextCodingUtil.prototype.jsAdjustSyntax(b, d);
  };
  a.BasicFunction = function(b) {
    b = this.Thread(b.statements[0]);
    return "function promise() {\n" + this.indent(b).trim() + "}";
  };
  a.BasicIteration = function(b) {
    var a = b.params[0], d = this.publishIterateVariable();
    b = this.Thread(b.statements[0]);
    this.unpublishIterateVariable();
    return "for (var " + d + " = 0; " + d + " < " + a + "; " + d + "++) {\n" + this.indent(b) + "}";
  };
  a.BasicIf = function(b) {
    if (2 == b.data.statements.length) {
      var a = this.Thread(b.statements[0]), d = this.Thread(b.statements[1]), e = b._schema.syntax.concat(), e = (b = b.data.params[0]) && "True" == b.data.type ? e[1] : void 0 === b ? e[1] : this.Block(b), a = "if (" + e + ") {\n" + this.indent(a) + "}\nelse {\n" + this.indent(d) + "}\n";
    } else {
      a = this.Thread(b.statements[0]), e = b._schema.syntax.concat(), e = (b = b.data.params[0]) && "True" == b.data.type ? e[1] : void 0 === b ? e[1] : this.Block(b), a = "if (" + e + ") {\n" + this.indent(a) + "}\n";
    }
    return a;
  };
  a.BasicWhile = function(b) {
    var a = this.Thread(b.statements[0]);
    return "while (" + b._schema.syntax.concat()[1] + ") {\n" + this.indent(a) + "}\n";
  };
  a.indent = function(b) {
    var a = "";
    b = b.split("\n");
    for (var d in b) {
      var e = b[d];
      0 != e.length && (a += "\t" + e + "\n");
    }
    return a;
  };
  a.publishIterateVariable = function() {
    var b = "", a = this._iterVariableCount;
    do {
      b = this._iterVariableChunk[a % 3] + b, a = parseInt(a / 3) - 1, 0 === a && (b = this._iterVariableChunk[0] + b);
    } while (0 < a);
    this._iterVariableCount++;
    return b;
  };
  a.unpublishIterateVariable = function() {
    this._iterVariableCount && this._iterVariableCount--;
  };
  a.Dropdown = function(b) {
    "OBSTACLE" == b ? b = "stone" : "ITEM" == b ? b = b.toLowerCase() : "WALL" == b && (b = b.toLowerCase());
    return "'" + b + "'";
  };
  a.TextInput = function(b) {
    return b;
  };
  a.DropdownDynamic = function(b, a) {
    return b = "null" == b ? "none" : Entry.TextCodingUtil.prototype.dropdownDynamicValueConvertor(b, a);
  };
})(Entry.BlockToJsParser.prototype);
Entry.KeyboardCode = function() {
};
(function(a) {
  a.keyCodeToChar = {8:"Backspace", 9:"Tab", 13:"Enter", 16:"Shift", 17:"Ctrl", 18:"Alt", 19:"Pause/Break", 20:"Caps Lock", 27:"Esc", 32:"Space", 33:"Page Up", 34:"Page Down", 35:"End", 36:"Home", 37:"Left", 38:"Up", 39:"Right", 40:"Down", 45:"Insert", 46:"Delete", 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 65:"A", 66:"B", 67:"C", 68:"D", 69:"E", 70:"F", 71:"G", 72:"H", 73:"I", 74:"J", 75:"K", 76:"L", 77:"M", 78:"N", 79:"O", 80:"P", 81:"Q", 82:"R", 83:"S", 84:"T", 
  85:"U", 86:"V", 87:"W", 88:"X", 89:"Y", 90:"Z", 91:"Windows", 93:"Right Click", 96:"Numpad 0", 97:"Numpad 1", 98:"Numpad 2", 99:"Numpad 3", 100:"Numpad 4", 101:"Numpad 5", 102:"Numpad 6", 103:"Numpad 7", 104:"Numpad 8", 105:"Numpad 9", 106:"Numpad *", 107:"Numpad +", 109:"Numpad -", 110:"Numpad .", 111:"Numpad /", 112:"F1", 113:"F2", 114:"F3", 115:"F4", 116:"F5", 117:"F6", 118:"F7", 119:"F8", 120:"F9", 121:"F10", 122:"F11", 123:"F12", 144:"Num Lock", 145:"Scroll Lock", 182:"My Computer", 183:"My Calculator", 
  186:";", 187:"=", 188:",", 189:"-", 190:".", 191:"/", 192:"`", 219:"[", 220:"\\", 221:"]", 222:"'"};
  a.keyCharToCode = {Backspace:8, Tab:9, Enter:13, Shift:16, Ctrl:17, Alt:18, "Pause/Break":19, "Caps Lock":20, Esc:27, Space:32, "Page Up":33, "Page Down":34, End:35, Home:36, Left:37, Up:38, Right:39, Down:40, Insert:45, Delete:46, 0:48, 1:49, 2:50, 3:51, 4:52, 5:53, 6:54, 7:55, 8:56, 9:57, A:65, B:66, C:67, D:68, E:69, F:70, G:71, H:72, I:73, J:74, K:75, L:76, M:77, N:78, O:79, P:80, Q:81, R:82, S:83, T:84, U:85, V:86, W:87, X:88, Y:89, Z:90, Windows:91, "Right Click":93, "Numpad 0":96, "Numpad 1":97, 
  "Numpad 2":98, "Numpad 3":99, "Numpad 4":100, "Numpad 5":101, "Numpad 6":102, "Numpad 7":103, "Numpad 8":104, "Numpad 9":105, "Numpad *":106, "Numpad +":107, "Numpad -":109, "Numpad .":110, "Numpad /":111, F1:112, F2:113, F3:114, F4:115, F5:116, F6:117, F7:118, F8:119, F9:120, F10:121, F11:122, F12:123, "Num Lock":144, "Scroll Lock":145, "My Computer":182, "My Calculator":183, ";":186, "=":187, ",":188, "-":189, ".":190, "/":191, "`":192, "[":219, "\\":220, "]":221, "'":222};
})(Entry.KeyboardCode.prototype);
Entry.BlockToPyParser = function(a) {
  this.blockSyntax = a;
  this._variableMap = new Entry.Map;
  this._funcMap = new Entry.Map;
  this._queue = new Entry.Queue;
};
(function(a) {
  a.Code = function(b, a) {
    this._parseMode = a;
    if (b instanceof Entry.Thread) {
      return this.Thread(b);
    }
    if (b instanceof Entry.Block) {
      return this.Block(b);
    }
    a = "";
    b = b.getThreads();
    for (var c = 0;c < b.length;c++) {
      a += this.Thread(b[c]) + "\n";
    }
    return a = a.trim();
  };
  a.Thread = function(b) {
    if (b instanceof Entry.Block) {
      return this.Block(b);
    }
    var a = "";
    b = b.getBlocks();
    for (var d = !1, e = "", f = "", g = 0;g < b.length;g++) {
      var h = b[g];
      if (this._parseMode == Entry.Parser.PARSE_GENERAL) {
        if (Entry.TextCodingUtil.prototype.isNoPrintBlock(h)) {
          continue;
        }
        0 == g ? (d = Entry.TextCodingUtil.prototype.isEventBlock(h)) ? e = this.Block(h) + "\n" : f += this.Block(h) + "\n" : 0 != g && (f += this.Block(h) + "\n");
      } else {
        this._parseMode == Entry.Parser.PARSE_SYNTAX && (a = (d = Entry.TextCodingUtil.prototype.isEventBlock(h)) ? "" : this.Block(h) + "\n");
      }
      this._queue.clear();
      this._variableMap.clear();
    }
    this._parseMode == Entry.Parser.PARSE_GENERAL && (a = d ? e + Entry.TextCodingUtil.prototype.indent(f) + "\n" : e + f + "\n");
    return a = a.trim() + "\n";
  };
  a.Block = function(b) {
    var a = "", d;
    b._schema && b._schema.syntax && (d = b._schema.syntax.py[0]);
    this.isFunc(b) ? (a += this.makeFuncDef(b), this.isRegisteredFunc(b) && (d = this.makeFuncSyntax(b))) : this.isFuncStmtParam(b) && (a += b.data.type);
    if (!d || null == d) {
      return a;
    }
    var e = /(%.)/mi, f = /(\$.)/mi;
    d = d.split(e);
    var g = b._schema.params, h = b.data.params, k = b._schema.skeleton, m = b._schema.paramsKeyMap, l;
    if (this._parseMode == Entry.Parser.PARSE_VARIABLE && k == Entry.Parser.BLOCK_SKELETON_BASIC && m) {
      var n;
    }
    for (var q = 0;q < d.length;q++) {
      if (n = d[q], 0 !== n.length) {
        if (e.test(n)) {
          n = n.split("%")[1];
          var r = Number(n) - 1;
          if (g[r] && "Indicator" != g[r].type) {
            if ("Block" == g[r].type) {
              if (l = this.Block(h[r]).trim(), r = this._funcMap.get(l)) {
                a += r;
              } else {
                var r = l.split("_"), t = r[0];
                2 == r.length && ("stringParam" == t ? l = "string_param" : "booleanParam" == t && (l = "boolean_param"));
                l = Entry.TextCodingUtil.prototype.variableFilter(b, n, l);
                a += l;
                this._parseMode == Entry.Parser.PARSE_VARIABLE && k == Entry.Parser.BLOCK_SKELETON_BASIC && m && (r = Object.keys(m), n = String(r[n++]), n = n.toLowerCase(), this._variableMap.put(n, l), this._queue.enqueue(n));
              }
            } else {
              l = this["Field" + g[r].type](h[r], g[r]), null == l && (l = g[r].text ? g[r].text : null), l = Entry.TextCodingUtil.prototype.binaryOperatorValueConvertor(l), l = String(l), Entry.TextCodingUtil.prototype.isNumeric(l) || Entry.TextCodingUtil.prototype.isBinaryOperator(l) || (l = String('"' + l + '"')), l = Entry.TextCodingUtil.prototype.variableFilter(b, n, l), Entry.TextCodingUtil.prototype.isLocalType(b, h[r]) && (l = "self".concat(".").concat(l)), a += l, this._parseMode == Entry.Parser.PARSE_VARIABLE && 
              k == Entry.Parser.BLOCK_SKELETON_BASIC && m && (r = Object.keys(m), n = String(r[n++]), n = n.toLowerCase(), this._variableMap.put(n, l), this._queue.enqueue(n));
            }
          }
        } else {
          if (f.test(n)) {
            for (n = n.split(f), l = 0;l < n.length;l++) {
              r = n[l], 0 !== r.length && (f.test(r) ? (r = Number(r.split("$")[1]) - 1, a += Entry.TextCodingUtil.prototype.indent(this.Thread(b.statements[r]))) : a += r);
            }
          } else {
            n.search("#"), -1 != n.search("#") && (l = n.indexOf("#"), n = n.substring(l + 1)), a += n;
          }
        }
      }
    }
    this._parseMode == Entry.Parser.PARSE_VARIABLE && k == Entry.Parser.BLOCK_SKELETON_BASIC && m && (b = Object.keys(m).length) && (a = this.makeExpressionWithVariable(a, b));
    return a;
  };
  a.FieldAngle = function(b) {
    return b;
  };
  a.FieldColor = function(b) {
    return b;
  };
  a.FieldDropdown = function(b) {
    return b;
  };
  a.FieldDropdownDynamic = function(b, a) {
    console.log("FieldDropdownDynamic", b, a);
    console.log("FieldDropdownDynamic Object", Entry.playground.object);
    return b = "null" == b ? "None" : Entry.TextCodingUtil.prototype.dropdownDynamicValueConvertor(b, a);
  };
  a.FieldImage = function(b) {
    return b;
  };
  a.FieldIndicator = function(b) {
    return b;
  };
  a.FieldKeyboard = function(b) {
    return b;
  };
  a.FieldOutput = function(b) {
    return b;
  };
  a.FieldText = function(b) {
    return b;
  };
  a.FieldTextInput = function(b) {
    return b;
  };
  a.FieldNumber = function(b) {
    return b;
  };
  a.FieldKeyboard = function(b) {
    (b = Entry.KeyboardCode.prototype.keyCodeToChar[b]) && null != b || (b = "Q");
    return b;
  };
  a.getBlockType = function(b) {
    return this.blockSyntax[b];
  };
  a.makeExpressionWithVariable = function(b, a) {
    var c = "", e = 0, f = b.indexOf("(");
    a = b.substring(0, f).trim().concat("(");
    if (this._queue.toString()) {
      for (;(variable = this._queue.dequeue()) && !(b = this._variableMap.get(variable), b = variable.concat(" = ").concat(b).concat("\n"), c += b, a = a.concat(variable).concat(",").concat(" "), e++, 10 < e);) {
      }
      f = a.lastIndexOf(",");
      a = a.substring(0, f);
      a = a.trim().concat(")");
      a = c.concat(a);
    } else {
      a = b;
    }
    return a;
  };
  a.isFunc = function(b) {
    return "func" == b.data.type.split("_")[0] ? !0 : !1;
  };
  a.isRegisteredFunc = function(b) {
    b = b.data.type.split("_");
    return Entry.variableContainer.functions_[b[1]] ? !0 : !1;
  };
  a.isFuncStmtParam = function(b) {
    b = b.data.type.split("_")[0];
    return "stringParam" == b || "booleanParam" == b ? !0 : !1;
  };
  a.makeFuncSyntax = function(b) {
    var a = b._schema.template.trim();
    b = b._schema.params;
    var d = /(%.)/mi, a = a.trim().split(d), e = "", f = "", g;
    for (g in a) {
      var h = a[g].trim();
      if (d.test(h)) {
        var k = h.split("%")[1], k = Number(k) - 1;
        "Indicator" != b[k].type && (f += h.concat(", "));
      } else {
        h = h.split(" "), e += h.join("__");
      }
    }
    k = f.lastIndexOf(",");
    f = f.substring(0, k);
    return e.trim().concat("(").concat(f.trim()).concat(")");
  };
  a.makeFuncDef = function(b) {
    var a = "def ", d = this.getFuncInfo(b);
    this.isRegisteredFunc(b) || (d.name = "f");
    if (d.name) {
      a += d.name;
    } else {
      return a;
    }
    a = a.concat("(");
    if (d.params && 0 != d.params.length) {
      for (var e in d.params) {
        a += d.params[e], a = a.concat(", ");
      }
      b = a.lastIndexOf(",");
      a = a.substring(0, b);
      a = a.trim();
    }
    a = a.concat("):").concat("\n");
    if (d.statements && d.statements.length) {
      b = "";
      for (var f in d.statements) {
        b += this.Block(d.statements[f]).concat("\n");
      }
      b = b.concat("\n");
      a += Entry.TextCodingUtil.prototype.indent(b).concat("\n");
    }
    this._funcMap.clear();
    return a;
  };
  a.getFuncInfo = function(b) {
    var a = {};
    if (b = b.data.type.split("_")[1]) {
      var d = Entry.variableContainer.functions_[b];
      if (!d) {
        return a.name = "\ud568\uc218", a;
      }
    } else {
      return a;
    }
    b = d.block.template;
    var e = b.search(/(%.)/);
    b = b.substring(0, e).trim().split(" ").join("__");
    Entry.TextCodingUtil.prototype.initQueue();
    Entry.TextCodingUtil.prototype.gatherFuncDefParam(d.content._data[0]._data[0].data.params[0]);
    for (var f = [], g = {};l = Entry.TextCodingUtil.prototype._funcParamQ.dequeue();) {
      f.push(l);
    }
    for (var h in f) {
      g[f[h]] = h;
    }
    Entry.TextCodingUtil.prototype.clearQueue();
    if (g) {
      var f = {}, k;
      for (k in g) {
        e = g[k];
        h = k.search("_");
        h = k.substring(0, h);
        if ("stringParam" == h) {
          var m = "value" + String(e + 1);
        } else {
          "booleanParam" == h && (m = "boolean" + String(e + 1));
        }
        var l = m;
        f[e] = l;
        this._funcMap.put(k, l);
      }
    }
    k = d.content._data[0]._data;
    m = [];
    for (d = 1;d < k.length;d++) {
      m.push(k[d]);
    }
    b && (a.name = b);
    0 != Object.keys(f).length && (a.params = f);
    0 != m.length && (a.statements = m);
    return a;
  };
})(Entry.BlockToPyParser.prototype);
Entry.JsToBlockParser = function(a) {
  this.syntax = a;
  this.scopeChain = [];
  this.scope = null;
  this._blockCount = 0;
  this._blockInfo = {};
};
(function(a) {
  a.Program = function(b) {
    var a = [], d = [];
    d.push({type:this.syntax.Program});
    for (var e in b) {
      var f = b[e];
      if ("Program" != f.type) {
        return;
      }
      this.initScope(f);
      var f = this.BlockStatement(f), g;
      for (g in f) {
        d.push(f[g]);
      }
      this.unloadScope();
      0 != d.length && a.push(d);
    }
    return a;
  };
  a.Identifier = function(b) {
    return b.name;
  };
  a.Literal = function(b, a) {
    return !0 === b.value ? {type:"True"} : !1 === b.value ? {type:"False"} : "ai_distance_value" == a ? b.value : "ai_boolean_object" == a ? b.value : {type:"text", params:[b.value]};
  };
  a.ExpressionStatement = function(b) {
    b = b.expression;
    return this[b.type](b);
  };
  a.ForStatement = function(b) {
    var a = b.init, d = b.test, e = b.update, f = b.body;
    if (this.syntax.ForStatement) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
    }
    var f = this[f.type](f), a = a.declarations[0].init.value, g = d.operator, d = d.right.value, h = 0;
    "++" != e.operator && (e = a, a = d, d = e);
    switch(g) {
      case "<":
        h = d - a;
        break;
      case "<=":
        h = d + 1 - a;
        break;
      case ">":
        h = a - d;
        break;
      case ">=":
        h = a + 1 - d;
    }
    return this.BasicIteration(b, h, f);
  };
  a.BlockStatement = function(b) {
    var a = [];
    b = b.body;
    for (var d = 0;d < b.length;d++) {
      var e = b[d], f = this[e.type](e);
      Entry.TextCodingUtil.prototype.hasBlockInfo(e, this._blockInfo) || this._blockCount++;
      Entry.TextCodingUtil.prototype.updateBlockInfo(e, this._blockInfo);
      if (f) {
        if (void 0 === f.type) {
          throw {title:"\ube14\ub85d\ubcc0\ud658 \uc624\ub958", message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ube14\ub85d\uc785\ub2c8\ub2e4.", node:e, blockCount:this._blockCount};
        }
        Entry.TextCodingUtil.prototype.isParamBlock(f) || f && a.push(f);
      }
    }
    return a;
  };
  a.EmptyStatement = function(b) {
    throw {message:"empty\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.DebuggerStatement = function(b) {
    throw {message:"debugger\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.WithStatement = function(b) {
    throw {message:"with\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ReturnStaement = function(b) {
    throw {message:"return\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.LabeledStatement = function(b) {
    throw {message:"label\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.BreakStatement = function(b) {
    throw {message:"break\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ContinueStatement = function(b) {
    throw {message:"continue\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.IfStatement = function(b) {
    if (this.syntax.BasicIf) {
      return this.BasicIf(b);
    }
    throw {message:"if\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.SwitchStatement = function(b) {
    throw {message:"switch\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.SwitchCase = function(b) {
    throw {message:"switch ~ case\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ThrowStatement = function(b) {
    throw {message:"throw\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.TryStatement = function(b) {
    throw {message:"try\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.CatchClause = function(b) {
    throw {message:"catch\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.WhileStatement = function(b) {
    var a = b.body, d = this.syntax.WhileStatement, a = this[a.type](a);
    if (d) {
      throw {message:"while\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
    }
    return this.BasicWhile(b, a);
  };
  a.DoWhileStatement = function(b) {
    throw {message:"do ~ while\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ForInStatement = function(b) {
    throw {message:"for ~ in\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.FunctionDeclaration = function(b) {
    if (this.syntax.FunctionDeclaration) {
      throw {message:"function\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
    }
    return null;
  };
  a.VariableDeclaration = function(b) {
    throw {message:"var\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ThisExpression = function(b) {
    return this.scope.this;
  };
  a.ArrayExpression = function(b) {
    throw {message:"array\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.ObjectExpression = function(b) {
    throw {message:"object\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.Property = function(b) {
    throw {message:"init, get, set\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.FunctionExpression = function(b) {
    throw {message:"function\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.UnaryExpression = function(b) {
    throw {message:b.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:b};
  };
  a.UnaryOperator = function() {
    return "- + ! ~ typeof void delete".split(" ");
  };
  a.updateOperator = function() {
    return ["++", "--"];
  };
  a.BinaryOperator = function() {
    return "== != === !== < <= > >= << >> >>> + - * / % , ^ & in instanceof".split(" ");
  };
  a.AssignmentExpression = function(b) {
    throw {message:b.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:b};
  };
  a.AssignmentOperator = function() {
    return "= += -= *= /= %= <<= >>= >>>= ,= ^= &=".split(" ");
  };
  a.BinaryExpression = function(b) {
    var a, d = {};
    a = String(b.operator);
    var e = b.left.name;
    switch(a) {
      case "==":
        var f = "object_up" == e || "object_right" == e || "object_down" == e ? "ai_boolean_object" : "radar_up" == e || "radar_right" == e || "radar_down" == e ? "ai_boolean_distance" : null;
        break;
      case "<":
        f = "ai_boolean_distance";
        break;
      case "<=":
        f = "ai_boolean_distance";
        break;
      case ">":
        f = "ai_boolean_distance";
        break;
      case ">=":
        f = "ai_boolean_distance";
    }
    if (f) {
      e = [];
      a = b.left;
      if ("Literal" == a.type || "Identifier" == a.type) {
        arguments = [];
        arguments.push(a);
        a = Entry.block[f].params;
        for (var g in a) {
          var h = a[g].type;
          "Indicator" == h ? (h = {raw:null, type:"Literal", value:null}, g < arguments.length && arguments.splice(g, 0, h)) : "Text" == h && (h = {raw:"", type:"Literal", value:""}, g < arguments.length && arguments.splice(g, 0, h));
        }
        for (var k in arguments) {
          a = arguments[k], h = this[a.type](a), (h = Entry.TextCodingUtil.prototype.radarVariableConvertor(h)) && null != h && e.push(h);
        }
      } else {
        h = this[a.type](a), (h = Entry.TextCodingUtil.prototype.radarVariableConvertor(h)) && e.push(h);
      }
      if (a = String(b.operator)) {
        (h = a = Entry.TextCodingUtil.prototype.jTobBinaryOperatorConvertor(a)) && e.push(h), d.operator = a;
      }
      a = b.right;
      if ("Literal" == a.type || "Identifier" == a.type) {
        arguments = [];
        arguments.push(a);
        a = Entry.block[f].params;
        for (g in a) {
          h = a[g].type, "Indicator" == h ? (h = {raw:null, type:"Literal", value:null}, g < arguments.length && arguments.splice(g, 0, h)) : "Text" == h && (h = {raw:"", type:"Literal", value:""}, g < arguments.length && arguments.splice(g, 0, h));
        }
        for (k in arguments) {
          if (a = arguments[k], h = this[a.type](a), "string" == typeof h && (g = h.split("_"), "radar" == g[0] && (a = {type:"ai_distance_value", params:[]}, a.params.push(g[1].toUpperCase()), h = a)), h && null != h && ("ai_boolean_object" == f && (h = h.params[0], e.splice(1, 1)), h = Entry.TextCodingUtil.prototype.tTobDropdownValueConvertor(h), e.push(h), console.log("rigth param", e), e[2] && "text" != e[2].type && "ai_distance_value" != e[2].type)) {
            throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b.test};
          }
        }
      } else {
        h = this[a.type](a), "ai_boolean_object" == f && (h = h.params[0], e.splice(1, 1)), h && e.push(h);
      }
      d.type = f;
      d.params = e;
    } else {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b.test};
    }
    return d;
  };
  a.LogicalExpression = function(b) {
    var a = {}, d = String(b.operator);
    switch(d) {
      case "&&":
        var e = "ai_boolean_and";
        break;
      default:
        e = "ai_boolean_and";
    }
    var f = [], d = b.left;
    if ("Literal" == d.type || "Identifier" == d.type) {
      arguments = [];
      arguments.push(d);
      var d = Entry.block[e].params, g;
      for (g in d) {
        var h = d[g].type;
        "Indicator" == h ? (h = {raw:null, type:"Literal", value:null}, g < arguments.length && arguments.splice(g, 0, h)) : "Text" == h && (h = {raw:"", type:"Literal", value:""}, g < arguments.length && arguments.splice(g, 0, h));
      }
      for (var k in arguments) {
        d = arguments[k], (d = this[d.type](d)) && null != d && f.push(d);
      }
    } else {
      (d = this[d.type](d)) && f.push(d);
    }
    if (d = String(b.operator)) {
      d = Entry.TextCodingUtil.prototype.logicalExpressionConvert(d), f.push(d);
    }
    d = b.right;
    if ("Literal" == d.type || "Identifier" == d.type) {
      arguments = [];
      arguments.push(d);
      d = Entry.block[e].params;
      for (g in d) {
        h = d[g].type, "Indicator" == h ? (h = {raw:null, type:"Literal", value:null}, g < arguments.length && arguments.splice(g, 0, h)) : "Text" == h && (h = {raw:"", type:"Literal", value:""}, g < arguments.length && arguments.splice(g, 0, h));
      }
      for (k in arguments) {
        d = arguments[k], (d = this[d.type](d)) && null != d && f.push(d);
      }
      if ("True" != f[0].type && "ai_boolean_distance" != f[0].type && "ai_boolean_object" != f[0].type && "ai_boolean_and" != f[0].type && "ai_distance_value" != f[0].type) {
        throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub801\uc5b4 \uc785\ub2c8\ub2e4.", node:b};
      }
      if ("True" != f[2].type && "ai_boolean_distance" != f[2].type && "ai_boolean_object" != f[2].type && "ai_boolean_and" != f[2].type && "ai_distance_value" != f[2].type) {
        throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub801\uc5b4 \uc785\ub2c8\ub2e4.", node:b};
      }
    } else {
      (d = this[d.type](d)) && f.push(d);
    }
    a.type = e;
    a.params = f;
    return a;
  };
  a.LogicalOperator = function() {
    return ["||", "&&"];
  };
  a.MemberExpression = function(b) {
    var a = b.object, d = b.property, a = this[a.type](a), d = this[d.type](d, a);
    if (Object(a) !== a || Object.getPrototypeOf(a) !== Object.prototype) {
      throw {message:a + "\uc740(\ub294) \uc798\ubabb\ub41c \uba64\ubc84 \ubcc0\uc218\uc785\ub2c8\ub2e4.", node:b};
    }
    a = d;
    if (!a) {
      throw {message:d + "\uc774(\uac00) \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.", node:b};
    }
    return a;
  };
  a.ConditionalExpression = function(b) {
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.UpdateExpression = function(b) {
    throw {message:b.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub801\uc5b4 \uc785\ub2c8\ub2e4.", node:b};
  };
  a.CallExpression = function(b) {
    var a = b.callee;
    b = b.arguments;
    for (var d = [], a = this[a.type](a), a = this.syntax.Scope[a], e = Entry.block[a], f = 0;f < b.length;f++) {
      var g = b[f], g = this[g.type](g, a);
      "Dropdown" != e.params[f].type && "Block" === e.params[f].type && (g = "string" == typeof g ? {type:"text", params:[g]} : "number" == typeof g ? {type:"number", params:[g]} : g);
      d.push(g);
    }
    return {type:a, params:d};
  };
  a.NewExpression = function(b) {
    throw {message:"new\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.SequenceExpression = function(b) {
    throw {message:"SequenceExpression \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
  };
  a.initScope = function(b) {
    if (null === this.scope) {
      var a = function() {
      };
      a.prototype = this.syntax.Scope;
    } else {
      a = function() {
      }, a.prototype = this.scope;
    }
    this.scope = new a;
    this.scopeChain.push(this.scope);
    return this.scanDefinition(b);
  };
  a.unloadScope = function() {
    this.scopeChain.pop();
    this.scope = this.scopeChain.length ? this.scopeChain[this.scopeChain.length - 1] : null;
  };
  a.scanDefinition = function(b) {
    b = b.body;
    for (var a = [], d = 0;d < b.length;d++) {
      var e = b[d];
      "FunctionDeclaration" === e.type && (this.scope[e.id.name] = this.scope.promise, this.syntax.BasicFunction && (e = e.body, a.push([{type:this.syntax.BasicFunction, statements:[this[e.type](e)]}])));
    }
    return a;
  };
  a.BasicFunction = function(b, a) {
    return null;
  };
  a.BasicIteration = function(b, a, d) {
    if (10 < a) {
      throw {message:"\ubc18\ubcf5 \uc22b\uc790\uac12\uc774 10\uc744 \ub118\uc73c\uba74 \uc548\ub429\ub2c8\ub2e4.", node:b.test};
    }
    var c = this.syntax.BasicIteration;
    if (!c) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b};
    }
    return {params:[a], type:c, statements:[d]};
  };
  a.BasicWhile = function(b, a) {
    var c = b.test.raw;
    if (this.syntax.BasicWhile[c]) {
      return {type:this.syntax.BasicWhile[c], statements:[a]};
    }
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b.test};
  };
  a.BasicIf = function(b) {
    var a = {params:[], statements:[]}, d, e = [], f = [], g = [], h = b.consequent;
    if (h) {
      var k = this[h.type](h);
    }
    if (h = b.alternate) {
      var m = this[h.type](h);
    }
    try {
      var l = b.test.operator ? "===" === b.test.operator ? "==" : b.test.operator : null, n = b.test.left && b.test.right ? b.test.left.name + b.test.right.value : null;
      if ("frontwall" == n && "==" == l) {
        d = this.syntax.BasicIf["front == 'wall'"];
      } else {
        if ("fronthump" == n && "==" == l) {
          d = this.syntax.BasicIf["front == 'hump'"];
        } else {
          if ("frontstone" == n && "==" == l) {
            d = this.syntax.BasicIf["front == 'stone'"];
          } else {
            if ("frontbee" == n && "==" == l) {
              d = this.syntax.BasicIf["front == 'bee'"];
            } else {
              if (b.test.value || b.test.left && b.test.right) {
                d = "ai_if_else";
                var q = this[b.test.type](b.test, this.syntax.Scope);
                g.push(q);
              } else {
                throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b.test};
              }
            }
          }
        }
      }
      d ? (k && 0 != k.length && a.statements.push(k), m && 0 != m.length && a.statements.push(m), d && (a.type = d), g && 0 != g.length && (a.params = g)) : (k && 0 != k.length && (e = k), m && 0 != m.length && (f = m), d && (a.type = d), g && 0 != g.length && (a.params = g), a.statements = [e, f]);
      return a;
    } catch (r) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:b.test};
    }
  };
})(Entry.JsToBlockParser.prototype);
Entry.PyToBlockParser = function(a) {
  this.blockSyntax = a;
  this._blockStatmentIndex = 0;
  this._blockStatments = [];
  this._variableMap = new Entry.Map;
  this._funcMap = new Entry.Map;
  this._paramQ = new Entry.Queue;
};
(function(a) {
  a.Program = function(b) {
    var a = [], d;
    for (d in b) {
      if ("Program" != b[d].type) {
        return;
      }
      var e = [], f = b[d].body;
      console.log("nodes", f);
      for (d in f) {
        var g = f[d];
        console.log("Program node", g);
        g = this[g.type](g);
        console.log("result block", g);
        g && g.type && e.push(g);
      }
      console.log("thread", e);
      0 != e.length && a.push(e);
    }
    return a;
  };
  a.ExpressionStatement = function(b) {
    console.log("ExpressionStatement component", b);
    var a = {};
    b = b.expression;
    b.type && (b = this[b.type](b), console.log("ExpressionStatement expressionData", b), b.type && b.params ? (a.type = b.type, a.params = b.params, result = a) : b.type ? (a.type = b.type, result = a) : result = b);
    console.log("ExpressionStatement result", result);
    return result;
  };
  a.CallExpression = function(b) {
    console.log("CallExpression component", b);
    var a = {}, d = [], e, f = b.callee, g = this[f.type](f);
    console.log("CallExpression calleeData", g);
    arguments = b.arguments;
    if ("Identifier" == f.type) {
      console.log("CallExpression Identifier calleeData", g), a.callee = g, t = Entry.TextCodingUtil.prototype.eventBlockSyntaxFilter(g.name), e = this.getBlockType(t);
    } else {
      var h = g.object;
      e = g.property;
      if (h.statements && "call" == e.name && 0 == e.userCode) {
        e = h.statements, console.log("CallExpression statement", e), a.statements = e;
      } else {
        var k = h.name ? String(h.name).concat(".").concat(String(e.name)) : h.object.name ? String(h.object.name).concat(".").concat(String(h.property.name)).concat(".").concat(String(e.name)) : null;
      }
      console.log("CallExpression calleeName", k);
      e = this.getBlockType(k);
      console.log("CallExpression type before", e);
      if (k) {
        var m = k.split(".");
      }
      console.log("CallExpression calleeTokens", m);
      if ("__pythonRuntime.functions.range" == k) {
        var l = "%1number#";
        e = this.getBlockType(l);
      } else {
        if ("__pythonRuntime.ops.add" == k) {
          l = "(%1 %2calc_basic# %3)", e = this.getBlockType(l), f = {raw:"PLUS", type:"Literal", value:"PLUS"}, console.log("arguments geniuse", arguments), 2 == arguments.length && arguments.splice(1, 0, f), a.operator = "PLUS";
        } else {
          if ("__pythonRuntime.ops.multiply" == k) {
            l = "(%1 %2calc_basic# %3)", e = this.getBlockType(l), f = {raw:"MULTI", type:"Literal", value:"MULTI"}, 2 == arguments.length && arguments.splice(1, 0, f), a.operator = "MULTI";
          } else {
            if ("__pythonRuntime.ops.in" == k) {
              l = "%4 in %2", e = this.getBlockType(l);
            } else {
              if ("__pythonRuntime.functions.len" == k) {
                l = "len", e = this.getBlockType(l);
              } else {
                if ("Identifier" == f.object.type && "append" == m[1] || "MemberExpression" == f.object.type && "self" == m[0] && "append" == m[2]) {
                  l = "%2.append", e = this.getBlockType(l);
                } else {
                  if ("Identifier" == f.object.type && "insert" == m[1] || "MemberExpression" == f.object.type && "self" == m[0] && "insert" == m[2]) {
                    l = "%2.insert", e = this.getBlockType(l);
                  } else {
                    if ("Identifier" == f.object.type && "pop" == m[1] || "MemberExpression" == f.object.type && "self" == m[0] && "pop" == m[2]) {
                      l = "%2.pop", e = this.getBlockType(l);
                    }
                  }
                }
              }
            }
          }
        }
      }
      a.callee = k;
    }
    console.log("CallExpression type after", e);
    if (e) {
      var n = Entry.block[e], f = n.params, n = n.def.params;
      console.log("CallExpression component.arguments", arguments);
      console.log("CallExpression paramsMeta", f);
      console.log("CallExpression paramsDefMeta", n);
      for (var q in f) {
        h = f[q].type, "Indicator" == h ? (h = {raw:null, type:"Literal", value:null}, q < arguments.length && arguments.splice(q, 0, h)) : "Text" == h && (h = {raw:"", type:"Literal", value:""}, q < arguments.length && arguments.splice(q, 0, h));
      }
      console.log("CallExpression arguments", arguments);
      for (var r in arguments) {
        if (q = arguments[r]) {
          console.log("CallExpression argument", q, "typeof", typeof q), q = this[q.type](q, f[r], n[r], !0), console.log("CallExpression param", q), "__pythonRuntime.functions.range" == k && q.type ? (e = q.type, d = q.params) : d.push(q);
        }
      }
      console.log("CallExpression syntax", l);
      console.log("CallExpression argument params", d);
      if ("%2.append" == l || "%2.pop" == l) {
        if ("self" == m[0]) {
          var h = Entry.playground.object, t = m[1];
          if (!Entry.TextCodingUtil.prototype.isLocalListExisted(t, h)) {
            return a;
          }
        } else {
          if (t = m[0], !Entry.TextCodingUtil.prototype.isGlobalListExisted(t)) {
            return a;
          }
        }
        console.log("CallExpression append calleeData", g);
        r = this.ParamDropdownDynamic(t, f[1], n[1]);
        console.log("CallExpression listName", r);
        d.push(r);
        console.log("CallExpression params[0]", d[0]);
        "%2.pop" == l && ("number" == d[0].type ? d[0].params[0] += 1 : "text" == d[0].type && (d[0].params[0] = String(Number(d[0].params[0]) + 1)));
      } else {
        if ("%2.insert" == l) {
          if ("self" == m[0]) {
            if (h = Entry.playground.object, t = m[1], !Entry.TextCodingUtil.prototype.isLocalListExisted(t, h)) {
              return a;
            }
          } else {
            if (t = m[0], !Entry.TextCodingUtil.prototype.isGlobalListExisted(t)) {
              return a;
            }
          }
          console.log("CallExpression insert params", d);
          d.pop();
          console.log("CallExpression append calleeData", g);
          r = this.ParamDropdownDynamic(t, f[1], n[1]);
          console.log("CallExpression listName", r);
          d.splice(0, 0, r);
          console.log("CallExpression check arguments", arguments);
          console.log("CallExpression arguments[1] 2", arguments[1]);
          q = this[arguments[1].type](arguments[1], f[2], n[2], !0);
          console.log("CallExpression check param", q);
          d.splice(0, 0, q);
          console.log("CallExpression insert params", d);
          "number" == d[2].type ? d[2].params[0] += 1 : "text" == d[2].type && (d[2].params[0] = String(Number(d[2].params[0]) + 1));
        } else {
          "len" == l ? (r = this.ParamDropdownDynamic(d[1].name, f[1], n[1]), delete d[1], d[1] = r) : "%4 in %2" == l && (q = b.arguments[1], q = this[q.type](q, f[3], n[3], !0), r = b.arguments[3].name, r = this.ParamDropdownDynamic(r, f[1], n[1]), d = [], d.push(""), d.push(r), d.push(""), d.push(q), d.push(""));
        }
      }
      e && (a.type = e);
      d && (a.params = d);
    } else {
      d = [];
      for (r in arguments) {
        q = arguments[r], console.log("CallExpression argument", q, "typeof", typeof q), f = this[q.type](q), console.log("CallExpression argumentData", f), "__pythonRuntime.utils.createParamsObj" == f.callee ? d = f.arguments : d.push(f);
      }
      console.log("CallExpression args", d);
      a.arguments = d;
    }
    console.log("CallExpression Function Check result", a);
    if (a.arguments && a.arguments[0] && "__pythonRuntime.utils.createParamsObj" == a.arguments[0].callee) {
      return a;
    }
    a.callee && (d = a.callee.name + (a.arguments ? a.arguments.length : 0), console.log("funcKey", d), e = this._funcMap.get(d)) && (a = {}, a.type = e);
    console.log("CallExpression result", a);
    return a;
  };
  a.Identifier = function(b, a, d) {
    console.log("Identifier component", b, "paramMeta", a, "paramDefMeta", d);
    a = {};
    a.name = b.name;
    if (!0 === b.userCode || !1 === b.userCode) {
      a.userCode = b.userCode;
    }
    if (d = this.getBlockType("%1")) {
      b = b.name;
      var c = Entry.block[d], f = c.params, c = c.def.params;
      if (!Entry.TextCodingUtil.prototype.isGlobalVariableExisted(b)) {
        return a;
      }
      var g = [], h, k;
      for (k in f) {
        console.log("Identifiler paramsMeta, paramsDefMeta", f[k], c[k]), "Text" != f[k].type && (h = this["Param" + f[k].type](b, f[k], c[k]));
      }
      console.log("Identifiler param", h);
      h && g.push(h);
      a.type = d;
      0 != g.length && (a.params = g);
    }
    console.log("Identifiler result", a);
    return a;
  };
  a.VariableDeclaration = function(b) {
    console.log("VariableDeclaration component", b);
    var a = {declarations:[]}, d, e;
    b = b.declarations;
    for (var f in b) {
      var g = b[f], g = this[g.type](g);
      console.log("VariableDeclaration declarationData", g);
      g && a.declarations.push(g);
      g && g.type && (d = g.type);
      g && g.params && (e = g.params);
    }
    d && (a.type = d);
    e && (a.params = e);
    console.log("VariableDeclaration result", a);
    return a;
  };
  a.VariableDeclarator = function(b) {
    console.log("VariableDeclarator component", b);
    var a = {}, d, e;
    e = b.id;
    var f = b.init;
    if ("__params0" != e.name && "__formalsIndex0" != e.name && "__args0" != e.name) {
      if (f.callee && "__getParam0" == f.callee.name) {
        return a.name = e.name, a;
      }
      var g;
      console.log("VariableDeclarator init", f);
      if (f.callee && f.callee.object && f.callee.property) {
        if (f.callee.object.object && f.callee.object.object.name) {
          var h = f.callee.object.object.name;
        }
        if (f.callee.object.property && f.callee.object.property.name) {
          var k = f.callee.object.property.name;
        }
        if (f.callee.property.name) {
          var m = f.callee.property.name;
        }
        h && k && m && (g = h.concat(".").concat(k).concat(".").concat(m));
      }
      if ("__pythonRuntime.objects.list" == g) {
        h = this[e.type](e);
        console.log("VariableDeclarator idData", h);
        a.id = h;
        g = this[f.type](f);
        console.log("VariableDeclarator initData", g);
        a.init = g;
        h = e.name;
        f = [];
        arguments = g.arguments;
        for (d in arguments) {
          var l = {};
          l.data = String(arguments[d].params[0]);
          f.push(l);
        }
        Entry.TextCodingUtil.prototype.isGlobalListExisted(h) ? Entry.TextCodingUtil.prototype.updateGlobalList(h, f) : Entry.TextCodingUtil.prototype.createGlobalList(h, f);
      } else {
        h = e.name;
        g = "Literal" == f.type ? f.value : "Identifier" == f.type ? f.name : NaN;
        console.log("variable name", h, "value", g);
        g && NaN != g && (h.includes("__filbert") || (Entry.TextCodingUtil.prototype.isGlobalVariableExisted(h) ? Entry.TextCodingUtil.prototype.updateGlobalVariable(h, g) : Entry.TextCodingUtil.prototype.createGlobalVariable(h, g)));
        h = this[e.type](e);
        console.log("VariableDeclarator idData", h);
        a.id = h;
        g = this[f.type](f);
        console.log("VariableDeclarator initData", g);
        a.init = g;
        console.log("VariableDeclarator init.type", f.type);
        if ("Literal" == f.type) {
          d = e = this.getBlockType("%1 = %2");
        } else {
          if (g.params && g.params[0] && g.params[0].name && h.name == g.params[0].name) {
            if (console.log("VariableDeclarator idData.name", h.name, "initData.params[0].name", g.params[0].name), d = e = this.getBlockType("%1 += %2"), "PLUS" != g.operator) {
              return a;
            }
          } else {
            d = e = this.getBlockType("%1 = %2");
          }
        }
        k = Entry.block[e];
        e = k.params;
        k = k.def.params;
        h.name && (l = this.ParamDropdownDynamic(h.name, e[0], k[0]));
        e = [];
        "Literal" == f.type ? (h.params && h.params[0] ? e.push(h.params[0]) : e.push(l), e.push(g)) : (console.log("VariableDeclarator idData", h, "initData", g), g.params && g.params[0] && h.name == g.params[0].name ? (console.log("in initData.params[0]"), h.params && h.params[0] ? e.push(h.params[0]) : e.push(l), e.push(g.params[2])) : (console.log("in initData"), h.params && h.params[0] ? e.push(h.params[0]) : e.push(l), e.push(g)));
        a.type = d;
        a.params = e;
      }
      console.log("VariableDeclarator result", a);
      return a;
    }
  };
  a.Literal = function(b, a, d, e) {
    console.log("Literal component", b, "paramMeta", a, "paramDefMeta", d, "aflag", e);
    e = b.value;
    console.log("Literal value", e);
    a || (a = {type:"Block"}, d || (d = "number" == typeof e ? {type:"number"} : {type:"text"}));
    if ("Indicator" == a.type) {
      return null;
    }
    if ("Text" == a.type) {
      return "";
    }
    console.log("Literal paramMeta", a, "paramDefMeta", d);
    null != b.value ? (a = this["Param" + a.type](e, a, d), console.log("Literal param", void 0)) : (a = [], d = this[b.left.type](b.left), a.push(d), a.push(b.operator), b = this[b.right.type](b.right), a.push(b));
    b = a;
    console.log("Literal result", b);
    return b;
  };
  a.ParamBlock = function(b, a, d) {
    console.log("ParamBlock value", b, "paramMeta", a, "paramDefMeta", d);
    a = {};
    var c = b, f = [];
    if (!0 === b) {
      return a.type = "True", a;
    }
    if (!1 === b) {
      return a.type = "False", a;
    }
    var g = Entry.block[d.type], h = g.params, g = g.def.params;
    if (h && 0 != h.length) {
      for (var k in h) {
        console.log("aaa", h[k], "bbb", g[k]), c = this["Param" + h[k].type](b, h[k], g[k]);
      }
    } else {
      c = b;
    }
    console.log("ParamBlock param", c);
    f.push(c);
    a.type = d.type;
    a.params = f;
    console.log("ParamBlock result", a);
    return a;
  };
  a.ParamAngle = function(b, a, d) {
    console.log("ParamAngle value, paramMeta, paramDefMeta", b, a, d);
    return b;
  };
  a.ParamTextInput = function(b, a, d) {
    console.log("ParamTextInput value, paramMeta, paramDefMeta", b, a, d);
    return b;
  };
  a.ParamColor = function(b, a, d) {
    console.log("ParamColor value, paramMeta, paramDefMeta", b, a, d);
    console.log("ParamColor result", b);
    return b;
  };
  a.ParamDropdown = function(b, a, d) {
    console.log("ParamDropdown value, paramMeta, paramDefMeta", b, a, d);
    var c;
    a = a.options;
    console.log("options", a);
    for (var f in a) {
      if (d = a[f], b == d[1]) {
        c = d[1];
        break;
      }
    }
    c && (c = String(c));
    console.log("ParamDropdown result", c);
    return c;
  };
  a.ParamDropdownDynamic = function(b, a, d) {
    console.log("ParamDropdownDynamic value, paramMeta, paramDefMeta", b, a, d);
    var c;
    if ("mouse" == b || "wall" == b || "wall_up" == b || "wall_down" == b || "wall_right" == b || "wall_left" == b) {
      return b;
    }
    a = a.options;
    console.log("ParamDropdownDynamic options", a);
    for (var f in a) {
      if (b == a[f][0]) {
        console.log("options[i][0]", a[f][0]);
        c = a[f][1];
        break;
      }
    }
    c && (c = String(c));
    console.log("ParamDropdownDynamic result", c);
    return c;
  };
  a.ParamKeyboard = function(b, a, d) {
    console.log("ParamKeyboard value, paramMeta, paramDefMeta", b, a, d);
    b = Entry.KeyboardCode.prototype.keyCharToCode[b];
    console.log("ParamKeyboard result", b);
    return b;
  };
  a.Indicator = function(b, a, d) {
  };
  a.MemberExpression = function(b) {
    console.log("MemberExpression component", b);
    var a = {}, d, e = b.object, f = b.property;
    d = this[e.type](e);
    a.object = d;
    var g = this[f.type](f);
    a.property = g;
    console.log("MemberExpression objectData", d);
    console.log("MemberExpression propertyData", g);
    if ("call" == g.name && 0 == g.userCode) {
      return a;
    }
    if ("__pythonRuntime.ops.subscriptIndex" == g.callee) {
      e = Entry.playground.object;
      if (d.object && "self" == d.object.name) {
        if (f = d.property.name, !Entry.TextCodingUtil.prototype.isLocalListExisted(f, e)) {
          return a;
        }
      } else {
        if (f = d.name, !Entry.TextCodingUtil.prototype.isGlobalListExisted(f)) {
          return a;
        }
      }
      d = e = this.getBlockType("%2[%4]");
      var arguments = g.arguments, e = Entry.block[e], h = e.params, k = e.def.params, f = this.ParamDropdownDynamic(f, h[1], k[1]);
      console.log("MemberExpression listName", f);
      g = [];
      g.push("");
      g.push(f);
      g.push("");
      "number" == arguments[0].type ? arguments[0].params[0] += 1 : "text" == arguments[0].type && (arguments[0].params[0] = String(Number(arguments[0].params[0]) + 1));
      g.push(arguments[0]);
      g.push("");
      a.type = d;
      a.params = g;
    } else {
      if (g = [], "self" == e.name) {
        d = e = this.getBlockType("%1");
        e = Entry.block[e];
        h = e.params;
        k = e.def.params;
        f = f.name;
        e = Entry.playground.object;
        if (!Entry.TextCodingUtil.prototype.isLocalVariableExisted(f, e)) {
          return a;
        }
        f = this.ParamDropdownDynamic(f, h[0], k[0]);
        g.push(f);
        a.type = d;
        0 != g.length && (a.params = g);
      } else {
        return a;
      }
    }
    console.log("MemberExpression result", a);
    return a;
  };
  a.WhileStatement = function(b) {
    console.log("WhileStatement component", b);
    var a;
    a = {statements:[]};
    var d = b.test;
    console.log("WhileStatement test", d);
    if (!0 === d.value) {
      var e = this.getBlockType("while True:\n$1");
    }
    console.log("WhileStatement type", e);
    var f = Entry.block[e].params;
    console.log("WhileStatement paramsMeta", f);
    var g = [];
    if ("Literal" == d.type || "Identifier" == d.type) {
      arguments = [];
      arguments.push(d);
      f = Entry.block[e].params;
      d = Entry.block[e].def.params;
      console.log("WhileStatement paramsMeta", f);
      console.log("WhileStatement paramsDefMeta", d);
      for (var h in f) {
        var k = f[h].type;
        "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
      }
      for (var m in arguments) {
        h = arguments[m], console.log("WhileStatement argument", h), h = this[h.type](h, f[m], d[m], !0), console.log("WhileStatement Literal param", h), h && null != h && g.push(h);
      }
    } else {
      h = this[d.type](d), console.log("WhileStatement Not Literal param", h), h && null != h && g.push(h);
    }
    f = b.body;
    f = this[f.type](f);
    console.log("WhileStatement bodyData", f);
    "True" == g[0].type && (a.type = e, a.statements.push(f.statements));
    console.log("WhileStatement result", a);
    return a;
  };
  a.BlockStatement = function(b) {
    console.log("BlockStatement component", b);
    var a = {statements:[], data:[]}, d = [], e = [], f = [];
    b = b.body;
    console.log("BlockStatement bodies", b);
    for (var g in b) {
      var h = b[g], h = this[h.type](h);
      console.log("BlockStatement bodyData", h);
      h && null == h || (f.push(h), console.log("BlockStatement data", f));
    }
    console.log("BlockStatement final data", f);
    a.data = f;
    console.log("jhlee data check", f);
    for (var k in f) {
      if (f[1] && "repeat_basic" == f[1].type) {
        if (0 == k) {
          if (f[k].declarations) {
            b = f[0].declarations;
            for (k in b) {
              h = b[k], (h = h.init) && d.push(h);
            }
            a.params = d;
          }
        } else {
          if (1 == k) {
            a.type = f[k].type;
            e = [];
            b = f[k].statements[0];
            console.log("BlockStatement allStatements", b);
            if (b && 0 != b.length) {
              for (g in b) {
                h = b[g], console.log("BlockStatement(for) statement", h), h.type && e.push(h);
              }
            }
            console.log("BlockStatement(for) statements", e);
            a.statements.push(e);
          }
        }
      } else {
        if (f) {
          if (0 == k) {
            if (f[k] && f[k].declarations) {
              b = f[k].declarations;
              for (k in b) {
                h = b[k], (h = h.init) && d.push(h);
              }
              a.params = d;
            } else {
              (h = f[k]) && h.type && e.push(h);
            }
          } else {
            e = [];
            if ((b = f) && 0 != b.length) {
              for (g in b) {
                h = b[g], console.log("BlockStatement statement", h), h && h.type && e.push(h);
              }
            }
            console.log("BlockStatement statements", e);
          }
          a.statements = e;
        }
      }
    }
    console.log("BlockStatement statement result", a);
    return a;
  };
  a.IfStatement = function(b) {
    console.log("IfStatement component", b);
    var a;
    a = {statements:[]};
    var d, e = [], f = b.consequent, g = b.alternate;
    d = null != g ? "if_else" : "_if";
    a.type = d;
    console.log("IfStatement type", d);
    var h = b.test;
    console.log("IfStatement test", h);
    if ("Literal" == h.type || "Identifier" == h.type) {
      arguments = [];
      arguments.push(h);
      h = Entry.block[d].params;
      d = Entry.block[d].def.params;
      console.log("IfStatement paramsMeta", h);
      console.log("IfStatement paramsDefMeta", d);
      for (var k in h) {
        var m = h[k].type;
        "Indicator" == m ? (m = {raw:null, type:"Literal", value:null}, k < arguments.length && arguments.splice(k, 0, m)) : "Text" == m && (m = {raw:"", type:"Literal", value:""}, k < arguments.length && arguments.splice(k, 0, m));
      }
      for (var l in arguments) {
        k = arguments[l], console.log("IfStatement argument", k), k = this[k.type](k, h[l], d[l], !0), console.log("IfStatement Literal param", k), k && null != k && e.push(k);
      }
    } else {
      k = this[h.type](h), console.log("IfStatement Not Literal param", k), k && null != k && e.push(k);
    }
    e && 0 != e.length && (a.params = e);
    console.log("IfStatement params result", e);
    if (null != f) {
      e = [];
      console.log("IfStatement consequent", f);
      f = this[f.type](f);
      console.log("IfStatement consequent data", f);
      f = f.data;
      console.log("IfStatement consequentsData", f);
      for (l in f) {
        h = f[l], console.log("IfStatement consData", h), h && (h.init && h.type ? (a.type = h.type, (h = h.statements) && (e = h)) : !h.init && h.type && e.push(h));
      }
      0 != e.length && (a.statements[0] = e);
    }
    if (null != g) {
      f = [];
      console.log("IfStatement alternate", g);
      g = this[g.type](g);
      console.log("IfStatement alternate data", g);
      g = g.data;
      for (l in g) {
        (e = g[l]) && e.type && f.push(e);
      }
      0 != f.length && (a.statements[1] = f);
    }
    console.log("IfStatement result", a);
    return a;
  };
  a.ForStatement = function(b) {
    console.log("ForStatement component", b);
    var a = {statements:[]}, d = this.getBlockType("for i in range");
    a.type = d;
    if (d = b.init) {
      var e = this[d.type](d);
    }
    a.init = e;
    console.log("ForStatement init", d);
    e = b.body.body;
    console.log("ForStatement bodies", e);
    if (e) {
      for (var f in e) {
        0 != f && (d = e[f], console.log("ForStatement bodyData", d, "index", f), d = this[d.type](d), console.log("ForStatement bodyData result", d, "index", f), a.statements.push(d));
      }
    }
    console.log("ForStatement bodyData result", a);
    if (f = b.test) {
      var g = this[f.type](f);
    }
    a.test = g;
    console.log("ForStatement testData", g);
    if (b = b.update) {
      var h = this[b.type](b);
    }
    a.update = h;
    console.log("ForStatement updateData", h);
    console.log("ForStatement result", a);
    return a;
  };
  a.ForInStatement = function(b) {
    console.log("ForInStatement component", b);
    console.log("ForInStatement result", null);
    return null;
  };
  a.BreakStatement = function(b) {
    console.log("BreakStatement component", b);
    b = {};
    var a = this.getBlockType("break");
    console.log("BreakStatement type", a);
    b.type = a;
    console.log("BreakStatement result", b);
    return b;
  };
  a.UnaryExpression = function(b) {
    console.log("UnaryExpression component", b);
    var a;
    b.prefix && (a = b.operator, b = b.argument, console.log("UnaryExpression operator", a), b.value = Number(a.concat(b.value)), a = this[b.type](b), console.log("UnaryExpression data", a));
    b = a;
    console.log("UnaryExpression result", b);
    return b;
  };
  a.LogicalExpression = function(b) {
    console.log("LogicalExpression component", b);
    var a;
    a = {};
    var d = String(b.operator);
    switch(d) {
      case "&&":
        var e = "(%1 and %3)";
        break;
      case "||":
        e = "(%1 or %3)";
        break;
      default:
        e = "(%1 and %3)";
    }
    var e = this.getBlockType(e), f = [], d = b.left;
    if ("Literal" == d.type || "Identifier" == d.type) {
      arguments = [];
      arguments.push(d);
      var d = Entry.block[e].params, g = Entry.block[e].def.params;
      console.log("LogicalExpression paramsMeta", d);
      console.log("LogicalExpression paramsDefMeta", g);
      for (var h in d) {
        var k = d[h].type;
        "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
      }
      for (var m in arguments) {
        var l = arguments[m];
        console.log("LogicalExpression argument", l);
        l = this[l.type](l, d[m], g[m], !0);
        console.log("LogicalExpression param", l);
        l && null != l && f.push(l);
      }
    } else {
      (l = this[d.type](d)) && f.push(l);
    }
    console.log("LogicalExpression left param", l);
    d = String(b.operator);
    console.log("LogicalExpression operator", d);
    d && (l = d = Entry.TextCodingUtil.prototype.logicalExpressionConvert(d), f.push(l));
    d = b.right;
    if ("Literal" == d.type || "Identifier" == d.type) {
      arguments = [];
      arguments.push(d);
      d = Entry.block[e].params;
      g = Entry.block[e].def.params;
      console.log("LogicalExpression paramsMeta", d);
      console.log("LogicalExpression paramsDefMeta", g);
      for (h in d) {
        k = d[h].type, "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
      }
      for (m in arguments) {
        l = arguments[m], console.log("LogicalExpression argument", l), l = this[l.type](l, d[m], g[m], !0), console.log("LogicalExpression param", l), l && null != l && f.push(l);
      }
    } else {
      (l = this[d.type](d)) && f.push(l);
    }
    console.log("LogicalExpression right param", l);
    a.type = e;
    a.params = f;
    console.log("LogicalExpression result", a);
    return a;
  };
  a.BinaryExpression = function(b) {
    console.log("BinaryExpression component", b);
    var a = {}, d = {}, e = String(b.operator);
    switch(e) {
      case "==":
        var f = "(%1 %2boolean_compare# %3)";
        break;
      case "!=":
        f = "(%2 != True)";
        break;
      case "<":
        f = "(%1 %2boolean_compare# %3)";
        break;
      case "<=":
        f = "(%1 %2boolean_compare# %3)";
        break;
      case ">":
        f = "(%1 %2boolean_compare# %3)";
        break;
      case ">=":
        f = "(%1 %2boolean_compare# %3)";
        break;
      case "+":
        f = "(%1 %2calc_basic# %3)";
        break;
      case "-":
        f = "(%1 %2calc_basic# %3)";
        break;
      case "*":
        f = "(%1 %2calc_basic# %3)";
        break;
      case "/":
        f = "(%1 %2calc_basic# %3)";
    }
    console.log("BinaryExpression operator", e);
    console.log("BinaryExpression syntax", f);
    if (f = this.getBlockType(f)) {
      console.log("BinaryExpression type", f);
      a = [];
      e = b.left;
      console.log("BinaryExpression left", e);
      if ("Literal" == e.type || "Identifier" == e.type) {
        arguments = [];
        arguments.push(e);
        var e = Entry.block[f].params, g = Entry.block[f].def.params;
        console.log("BinaryExpression paramsMeta", e);
        console.log("BinaryExpression paramsDefMeta", g);
        for (var h in e) {
          var k = e[h].type;
          "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
        }
        for (var m in arguments) {
          var l = arguments[m];
          console.log("BinaryExpression argument", l);
          l = this[l.type](l, e[m], g[m], !0);
          console.log("BinaryExpression param", l);
          l && null != l && a.push(l);
        }
      } else {
        (l = this[e.type](e)) && a.push(l);
      }
      console.log("BinaryExpression left params", a);
      if ("boolean_not" == f) {
        return a.splice(0, 0, ""), a.splice(2, 0, ""), console.log("BinaryExpression boolean_not params", a), d.type = f, d.params = a, d;
      }
      if (e = String(b.operator)) {
        console.log("BinaryExpression operator", e), (l = e = Entry.TextCodingUtil.prototype.binaryOperatorConvert(e)) && a.push(l), d.operator = e;
      }
      e = b.right;
      if ("Literal" == e.type || "Identifier" == e.type) {
        arguments = [];
        arguments.push(e);
        e = Entry.block[f].params;
        g = Entry.block[f].def.params;
        console.log("BinaryExpression paramsMeta", e);
        console.log("BinaryExpression paramsDefMeta", g);
        for (h in e) {
          k = e[h].type, "Indicator" == k ? (k = {raw:null, type:"Literal", value:null}, h < arguments.length && arguments.splice(h, 0, k)) : "Text" == k && (k = {raw:"", type:"Literal", value:""}, h < arguments.length && arguments.splice(h, 0, k));
        }
        for (m in arguments) {
          l = arguments[m], console.log("BinaryExpression argument", l), l = this[l.type](l, e[m], g[m], !0), console.log("BinaryExpression param", l), l && null != l && a.push(l);
        }
      } else {
        (l = this[e.type](e)) && a.push(l);
      }
      console.log("BinaryExpression right param", l);
      d.type = f;
      d.params = a;
    } else {
      return a;
    }
    console.log("BinaryExpression params", a);
    a = d;
    console.log("BinaryExpression result", a);
    return a;
  };
  a.UpdateExpression = function(b) {
    console.log("UpdateExpression", b);
    var a = {}, d = b.argument;
    if (d) {
      var e = this[d.type](d);
    }
    a.argument = e;
    a.operator = b.operator;
    a.prefix = b.prefix;
    console.log("UpdateExpression result", a);
    return a;
  };
  a.AssignmentExpression = function(b) {
    console.log("AssignmentExpression component", b);
    var a = {}, d, e = [], f, g = b.left;
    if (g.type) {
      var h = this[g.type](g);
      console.log("AssignmentExpression leftData", h);
    }
    console.log("AssignmentExpression leftData", h);
    a.left = h;
    operator = String(b.operator);
    console.log("AssignmentExpression operator", operator);
    g = b.right;
    if (g.type) {
      var k = this[g.type](g);
      console.log("AssignmentExpression rightData", k);
    }
    a.right = k;
    switch(operator) {
      case "=":
        if (k.callee && k.callee.object) {
          var m = k.callee.object.object.name.concat(".").concat(k.callee.object.property.name).concat(".").concat(k.callee.property.name);
        }
        if ("__pythonRuntime.objects.list" == m && "self" == h.object.name) {
          var l = h.property.name;
          d = [];
          var arguments = k.arguments, n;
          for (n in arguments) {
            var q = {};
            q.data = String(arguments[n].params[0]);
            d.push(q);
          }
          q = Entry.playground.object;
          Entry.TextCodingUtil.prototype.isLocalListExisted(l, q) ? Entry.TextCodingUtil.prototype.updateLocalList(l, d, q) : Entry.TextCodingUtil.prototype.createLocalList(l, d, q);
        }
        if (h.property && "__pythonRuntime.ops.subscriptIndex" == h.property.callee) {
          var l = "%1[%2] = %3", r = this.getBlockType(l);
        } else {
          g.arguments && g.arguments[0] ? (d = b.left.name ? b.left.name : b.left.object.name.concat(b.left.property.name), l = b.right.arguments[0].name ? b.right.arguments[0].name : b.right.arguments[0].object.name.concat(b.right.arguments[0].property.name), console.log("AssignmentExpression leftEx", d, "rightEx", l), l = b.right.arguments && d == l ? "%1 += %2" : "%1 = %2") : l = "%1 = %2", r = this.getBlockType(l);
        }
        d = r;
    }
    if (operator) {
      var t = Entry.TextCodingUtil.prototype.logicalExpressionConvert(operator);
    }
    a.operator = t;
    console.log("AssignmentExpression syntax", l);
    h.object ? q = h.object : h.name && (q = h.name);
    h.proprty ? f = h.property : h.name && (f = h.name);
    console.log("AssignmentExpression object property value", q, f);
    if ("%1[%2] = %3" == l) {
      f = h.params[1];
      console.log("AssignmentExpression listName", f);
      if (!f) {
        return a;
      }
      e.push(f);
      f = h.property.arguments[0];
      console.log("AssignmentExpression param 1", f);
      console.log("AssignmentExpression param 2", f);
      e.push(f);
      e.push(k);
    } else {
      if ("%1 = %2" == l) {
        console.log("AssignmentExpression calleeName check", m), q && "self" == q.name && "__pythonRuntime.objects.list" != m ? (q = Entry.block[r], h = q.params, m = q.def.params, l = f.name, (f = "number" == k.type || "text" == k.type ? k.params[0] : NaN) && NaN != f && (q = Entry.playground.object, console.log("final value", f), console.log("final object", q), Entry.TextCodingUtil.prototype.isLocalVariableExisted(l, q) ? Entry.TextCodingUtil.prototype.updateLocalVariable(l, f, q) : Entry.TextCodingUtil.prototype.createLocalVariable(l, 
        f, q)), l = this.ParamDropdownDynamic(l, h[0], m[0]), e.push(l)) : (q = Entry.block[r], h = q.params, m = q.def.params, console.log("property 123", f), l = f, (f = "number" == k.type || "text" == k.type ? k.params[0] : NaN) && NaN != f && (q = Entry.playground.object, console.log("final object", q), console.log("final value", f), Entry.TextCodingUtil.prototype.isGlobalVariableExisted(l, q) ? Entry.TextCodingUtil.prototype.updateGlobalVariable(l, f, q) : Entry.TextCodingUtil.prototype.createGlobalVariable(l, 
        f, q)), l = this.ParamDropdownDynamic(l, h[0], m[0]), e.push(l), k.callee && delete k.callee), e.push(k);
      } else {
        if ("%1 += %2" == l) {
          if (q && "self" == q.name) {
            if (q = Entry.block[r], h = q.params, m = q.def.params, l = f.name, q = Entry.playground.object, console.log("final object", q), !Entry.TextCodingUtil.prototype.isLocalVariableExisted(l, q)) {
              return a;
            }
          } else {
            if (q = Entry.block[r], h = q.params, m = q.def.params, l = f, !Entry.TextCodingUtil.prototype.isGlobalVariableExisted(l)) {
              return a;
            }
          }
          l = this.ParamDropdownDynamic(l, h[0], m[0]);
          e.push(l);
          e.push(k.params[2]);
        }
      }
    }
    a.type = d;
    a.params = e;
    console.log("AssignmentExpression result", a);
    return a;
  };
  a.FunctionDeclaration = function(b) {
    console.log("FunctionDeclaration component", b);
    var a = {}, d = b.body;
    b = b.id;
    if ("__getParam0" == b.name) {
      return a;
    }
    var e = this[d.type](d);
    console.log("FunctionDeclaration bodyData", e);
    if ("Identifier" == b.type) {
      var f = this[b.type](b);
    }
    console.log("FunctionDeclaration idData", f);
    d = [];
    b = [];
    var f = f.name, e = e.data, g;
    for (g in e) {
      if (e[g].declarations) {
        var h = e[g].declarations;
        0 < h.length && d.push(h[0].name);
      } else {
        e[g].argument && (h = e[g].argument.statements) && 0 < h.length && (b = h);
      }
    }
    console.log("FunctionDeclaration textFuncName", f);
    console.log("FunctionDeclaration textFuncParams", d);
    console.log("FunctionDeclaration textFuncStatements", b);
    var k, m, l, e = Entry.variableContainer.functions_, n;
    for (n in e) {
      var q = e[n];
      Entry.TextCodingUtil.prototype.initQueue();
      Entry.TextCodingUtil.prototype.gatherFuncDefParam(q.content._data[0]._data[0].data.params[0]);
      console.log("Entry.TextCodingUtil._funcParamQ", Entry.TextCodingUtil.prototype._funcParamQ);
      for (var r = [], h = {};g = Entry.TextCodingUtil.prototype._funcParamQ.dequeue();) {
        r.push(g), console.log("param", g);
      }
      console.log("funcParams", r);
      for (var t in r) {
        h[r[t]] = t;
      }
      console.log("paramMap", h);
      console.log("funcNameQueue", Entry.TextCodingUtil.prototype._funcNameQ);
      for (g = [];nameToken = Entry.TextCodingUtil.prototype._funcNameQ.dequeue();) {
        g.push(nameToken), console.log("funcNames", nameToken);
      }
      Entry.TextCodingUtil.prototype.clearQueue();
      blockFuncName = g.join("__").trim();
      console.log("first blockFuncName", blockFuncName);
      console.log("first textFuncName", f);
      if (f == blockFuncName) {
        if (console.log("textFuncName", f), console.log("blockFuncName", blockFuncName), console.log("textFuncParams.length", d.length), console.log("Object.keys(paramMap).length", Object.keys(h).length), d.length == Object.keys(h).length ? (k = !0, console.log("textFuncParams.length", d.length), console.log("Object.keys(paramMap).length", Object.keys(h).length), m = q.content._data[0]._data, g = m.slice(), g.shift(), console.log("blockFuncContents", m), m = Entry.TextCodingUtil.prototype.isFuncContentsMatch(g, 
        b, h)) : m = k = !1, k && m) {
          l = "func".concat("_").concat(n);
          break;
        } else {
          if (k && !m) {
            l = n;
            break;
          }
        }
      }
    }
    console.log("FunctionDeclaration foundFlag", k);
    console.log("FunctionDeclaration matchFlag", m);
    if (k && m) {
      console.log("targetFuncId", l);
      var u = d.length;
      this._funcMap.put(f + u, l);
      console.log("FunctionDeclaration this._funcMap", this._funcMap);
      a = l;
    } else {
      if (k && !m) {
        a = Entry.variableContainer.functions_[l];
        n = a.content._data[0];
        n._data.splice(1, n._data.length - 1);
        if (0 < b.length) {
          for (u in b) {
            t = b[u], t = new Entry.Block(t, n), n._data.push(t);
          }
        }
        Entry.variableContainer.saveFunction(a);
        Entry.variableContainer.updateList();
        a = l;
        console.log("textFuncName", f);
        u = d.length;
        u = f + u;
        n = l;
        l = "func".concat("_").concat(n);
        this._funcMap.put(u, l);
        console.log("FunctionDeclaration result", a);
      } else {
        console.log("FunctionDeclaration textFuncName", f);
        console.log("FunctionDeclaration textFuncParams", d);
        console.log("FunctionDeclaration textFuncStatements", b);
        k = new Entry.Func;
        k.generateBlock(!0);
        console.log("FunctionDeclaration newFunc", k);
        l = [];
        for (g = 1;g <= d.length + 1;g++) {
          l.push("%" + g);
        }
        k.block.template = f + " " + l.join(" ");
        console.log("newFunc template", k.block.template);
        n = k.content._data[0];
        t = n._data[0].data.params[0];
        l = t.data.params;
        k.description = "";
        g = f.split("__");
        if (0 < g.length) {
          for (e = 1;e < g.length;e++) {
            h = g[e], q = new Entry.Block({type:"function_field_label"}, n), q.data.params = [], q.data.params.push(h), m = Entry.TextCodingUtil.prototype.getLastParam(t), m.data.params[1] = q, k.description += h.concat(" ");
          }
          k.description += " ";
        } else {
          l[0] = f, k.description = f + " ";
        }
        if (0 < d.length) {
          for (e = new Entry.Block({type:"function_field_string"}, n), e.data.params = [], h = Entry.Func.requestParamBlock("string"), console.log("FunctionDeclaration stringParam", h), g = new Entry.Block({type:h}, n), e.data.params.push(g), m = Entry.TextCodingUtil.prototype.getLastParam(t), m.data.params[1] = e, k.paramMap[h] = Number(0), console.log("FunctionDeclaration paramBlock", k), t = 1;t < d.length;t++) {
            e = new Entry.Block({type:"function_field_string"}, n), e.data.params = [], h = Entry.Func.requestParamBlock("string"), console.log("FunctionDeclaration stringParam", h), g = new Entry.Block({type:h}, n), e.data.params.push(g), m = Entry.TextCodingUtil.prototype.searchFuncDefParam(l[1]), console.log("FunctionDeclaration paramBlock", m), 0 == m.data.params.length ? m.data.params[0] = g : 1 == m.data.params.length && (m.data.params[1] = e), k.paramMap[h] = Number(t), console.log("FunctionDeclaration paramBlock", 
            k);
          }
        }
        if (0 < b.length) {
          for (u in b) {
            t = b[u], t = new Entry.Block(t, n), n._data.push(t);
          }
        }
        Entry.Func.generateWsBlock(k);
        Entry.variableContainer.saveFunction(k);
        Entry.variableContainer.updateList();
        u = d.length;
        u = f + u;
        n = k.id;
        l = "func".concat("_").concat(n);
        this._funcMap.put(u, l);
        console.log("FunctionDeclaration newFunc", k);
      }
    }
    console.log("FunctionDeclaration result", a);
  };
  a.FunctionExpression = function(b) {
    console.log("FunctionExpression component", b);
    var a = {};
    b = b.body;
    b = this[b.type](b);
    console.log("FunctionExpression bodyData", b);
    a.statements = b.statements;
    console.log("FunctionExpression result", a);
    return a;
  };
  a.ReturnStatement = function(b) {
    console.log("ReturnStatement component", b);
    var a = {};
    if (b = b.argument) {
      var d = this[b.type](b);
    }
    d && (a.argument = d);
    console.log("ReturnStaement result", a);
    return a;
  };
  a.ThisExpression = function(b) {
    console.log("ThisExpression component", b);
    var a = {};
    if (b = b.userCode) {
      a.userCode = b;
    }
    console.log("ThisExpression result", a);
    return a;
  };
  a.NewExpression = function(b) {
    console.log("NewExpression component", b);
    var a = {}, d = b.callee, d = this[d.type](d), arguments = b.arguments, e = [], f;
    for (f in arguments) {
      var g = arguments[f];
      console.log("NewExpression argument", g);
      g = this[g.type](g);
      e.push(g);
    }
    a.callee = d;
    a.arguments = e;
    console.log("NewExpression result", a);
    return a;
  };
  a.getBlockType = function(b) {
    return this.blockSyntax[b];
  };
  a.RegExp = function(b) {
    console.log("RegExp", b);
    console.log("RegExp result", b);
    return b;
  };
  a.Function = function(b) {
    console.log("Function component", b);
    console.log("Function result", b);
    return b;
  };
  a.EmptyStatement = function(b) {
    console.log("EmptyStatement component", b);
    console.log("EmptyStatement result", b);
    return b;
  };
  a.DebuggerStatement = function(b) {
    console.log("DebuggerStatement component", b);
    console.log("DebuggerStatement result", b);
    return b;
  };
  a.WithStatement = function(b) {
    console.log("WithStatement component", b);
    console.log("WithStatement result", b);
    return b;
  };
  a.LabeledStatement = function(b) {
    console.log("LabeledStatement component", b);
    console.log("LabeledStatement result", b);
    return b;
  };
  a.ContinueStatement = function(b) {
    console.log("ContinueStatement component", b);
    console.log("ContinueStatement result", b);
    return b;
  };
  a.SwitchStatement = function(b) {
    console.log("SwitchStatement component", b);
    console.log("SwitchStatement result", b);
    return b;
  };
  a.SwitchCase = function(b) {
    console.log("SwitchCase component", b);
    console.log("SwitchCase result", b);
    return b;
  };
  a.ThrowStatement = function(b) {
    console.log("ThrowStatement component", b);
    console.log("ThrowStatement result", b);
    return b;
  };
  a.TryStatement = function(b) {
    console.log("TryStatement component", b);
    console.log("TryStatement result", b);
    return b;
  };
  a.CatchClause = function(b) {
    console.log("CatchClause component", b);
    console.log("CatchClause result", b);
    return b;
  };
  a.DoWhileStatement = function(b) {
    console.log("DoWhileStatement component", b);
    console.log("DoWhileStatement result", b);
    return b;
  };
  a.ArrayExpression = function(b) {
    console.log("ArrayExpression component", b);
    console.log("ArrayExpression result", b);
    return b;
  };
  a.ObjectExpression = function(b) {
    console.log("ObjectExpression component", b);
    console.log("ObjectExpression result", b);
    return b;
  };
  a.Property = function(b) {
    console.log("Property component", b);
    console.log("Property result", b);
    return b;
  };
  a.ConditionalExpression = function(b) {
    console.log("ConditionalExpression component", b);
    console.log("ConditionalExpression result", b);
    return b;
  };
  a.SequenceExpression = function(b) {
    console.log("SequenceExpression component", b);
    console.log("SequenceExpression result", b);
    return b;
  };
})(Entry.PyToBlockParser.prototype);
Entry.Console = function() {
  Entry.propertyPanel && (this.createView(), Entry.propertyPanel.addMode("console", this), Entry.console = this, this._isEditing = !1, this._inputData = null);
};
(function(a) {
  a.createView = function() {
    this.view = new Entry.Dom("div", {id:"entryConsole"});
    this.codeMirror = CodeMirror(this.view[0], {lineNumbers:!1, lineWrapping:!0, value:"", mode:{}, theme:"default", styleActiveLine:!1, lint:!1});
    this._doc = this.codeMirror.getDoc();
    this.codeMirror.on("beforeChange", function(b, a) {
      this._isEditing ? "+delete" === a.origin && 0 === a.to.ch && a.cancel() : a.cancel();
    }.bind(this));
    this.codeMirror.on("keyup", function(b, a) {
      this._isEditing && 13 === a.keyCode && this.endInput();
    }.bind(this));
    this.codeMirror.on("cursorActivity", function(b, a) {
      b.execCommand("goDocEnd");
    });
    Entry.addEventListener("stop", this.clear.bind(this));
    this.clear();
  };
  a.getView = function() {
    return this.view;
  };
  a.clear = function() {
    this.setEditing(!0);
    this.codeMirror.setValue("Entry Console \n");
    this.codeMirror.execCommand("goDocEnd");
    this.setEditing(!1);
  };
  a.print = function(b, a) {
    this.setEditing(!0);
    this.codeMirror.execCommand("goDocEnd");
    var c = this._doc.getCursor();
    this._doc.replaceRange(b + "\n", {line:c.line, ch:0});
    this._doc.addLineClass(c.line, "text", a);
    "speak" === a && this.setEditing(!1);
    this.codeMirror.execCommand("goDocEnd");
    "ask" === a && (this._doc.addLineClass(c.line + 1, "text", "answer"), this.codeMirror.focus());
  };
  a.endInput = function() {
    var b = this._doc.getCursor(), a = this.codeMirror.lineInfo(b.line);
    "answer" === a.textClass ? (this._inputData = a.text, this._doc.replaceRange("\n", {line:b.line, ch:a.text.length})) : this._inputData = this._doc.getLine(b.line - 1);
    Entry.container.setInputValue(this._inputData);
    this.setEditing(!1);
  };
  a.stopInput = function(b) {
    this.setEditing(!1);
  };
  a.setEditing = function(b) {
    this._isEditing !== b && (this._isEditing = b);
  };
})(Entry.Console.prototype);
Entry.Parser = function(a, b, c, d) {
  this._mode = a;
  this.syntax = {};
  this.codeMirror = c;
  this._lang = d || "js";
  this._type = b;
  this.availableCode = [];
  Entry.Parser.PARSE_GENERAL = 0;
  Entry.Parser.PARSE_SYNTAX = 1;
  Entry.Parser.PARSE_VARIABLE = 2;
  Entry.Parser.BLOCK_SKELETON_BASIC = "basic";
  Entry.Parser.BLOCK_SKELETON_BASIC_LOOP = "basic_loop";
  Entry.Parser.BLOCK_SKELETON_BASIC_DOUBLE_LOOP = "basic_double_loop";
  this._console = new Entry.Console;
  switch(this._lang) {
    case "js":
      this._parser = new Entry.JsToBlockParser(this.syntax);
      break;
    case "py":
      this._parser = new Entry.PyToBlockParser(this.syntax);
      d = this.syntax;
      var e = {}, f;
      for (f in d.Scope) {
        e[f + "();\n"] = d.Scope[f];
      }
      "BasicIf" in d && (e.front = "BasicIf");
      CodeMirror.commands.javascriptComplete = function(b) {
        CodeMirror.showHint(b, null, {globalScope:e});
      };
      c.on("keyup", function(b, a) {
        (65 <= a.keyCode && 95 >= a.keyCode || 167 == a.keyCode || 190 == a.keyCode) && CodeMirror.showHint(b, null, {completeSingle:!1, globalScope:e});
      });
      break;
    case "blockJs":
      this._parser = new Entry.BlockToJsParser(this.syntax);
      d = this.syntax;
      break;
    case "blockPy":
      this._parser = new Entry.BlockToPyParser(this.syntax), d = this.syntax;
  }
};
(function(a) {
  a.setParser = function(b, a, d) {
    this._mode = b;
    this._type = a;
    this._cm = d;
    this.syntax = this.mappingSyntax(b);
    switch(a) {
      case Entry.Vim.PARSER_TYPE_JS_TO_BLOCK:
        this._parser = new Entry.JsToBlockParser(this.syntax);
        this._parserType = Entry.Vim.PARSER_TYPE_JS_TO_BLOCK;
        break;
      case Entry.Vim.PARSER_TYPE_PY_TO_BLOCK:
        this._parser = new Entry.PyToBlockParser(this.syntax);
        this._parserType = Entry.Vim.PARSER_TYPE_PY_TO_BLOCK;
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_JS:
        this._parser = new Entry.BlockToJsParser(this.syntax);
        b = this.syntax;
        var c = {}, f;
        for (f in b.Scope) {
          c[f + "();\n"] = b.Scope[f];
        }
        d.on("keydown", function(b, a) {
          var d = a.keyCode;
          (65 <= d && 95 >= d || 167 == d || !a.shiftKey && 190 == d) && CodeMirror.showHint(b, null, {completeSingle:!1, globalScope:c});
        });
        this._parserType = Entry.Vim.PARSER_TYPE_JS_TO_BLOCK;
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_PY:
        this._parser = new Entry.BlockToPyParser(this.syntax), d.setOption("mode", {name:"python", globalVars:!0}), d.markText({line:0, ch:0}, {line:5}, {readOnly:!0}), this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_PY;
    }
  };
  a.parse = function(b, a) {
    var c = null;
    switch(this._type) {
      case Entry.Vim.PARSER_TYPE_JS_TO_BLOCK:
        try {
          var e = [];
          e.push(b);
          var f = [], g;
          for (g in e) {
            var h = e[g], h = h.trim(), k = acorn.parse(h);
            f.push(k);
          }
          c = this._parser.Program(f);
        } catch (q) {
          if (this.codeMirror) {
            q instanceof SyntaxError ? (b = {from:{line:q.loc.line - 1, ch:0}, to:{line:q.loc.line - 1, ch:q.loc.column}}, q.message = "\ubb38\ubc95(Syntax) \uc624\ub958\uc785\ub2c8\ub2e4.", q.type = 1) : (b = this.getLineNumber(q.node.start, q.node.end), b.message = q.message, b.severity = "converting error", q.type = 2);
            this.codeMirror.markText(b.from, b.to, {className:"CodeMirror-lint-mark-error", __annotation:b, clearOnEnter:!0});
            b = q.title ? q.title : "\ubb38\ubc95 \uc624\ub958";
            if (2 == q.type && q.message) {
              var m = q.message;
            } else {
              2 != q.type || q.message ? 1 == q.type && (m = "\uc790\ubc14\uc2a4\ud06c\ub9bd\ud2b8 \ubb38\ubc95\uc744 \ud655\uc778\ud574\uc8fc\uc138\uc694.") : m = "\uc790\ubc14\uc2a4\ud06c\ub9bd\ud2b8 \ucf54\ub4dc\ub97c \ud655\uc778\ud574\uc8fc\uc138\uc694.";
            }
            Entry.toast.alert(b, m);
            m = {};
            m.boardType = Entry.Workspace.MODE_BOARD;
            m.textType = Entry.Vim.TEXT_TYPE_JS;
            m.runType = Entry.Vim.MAZE_MODE;
            Ntry.dispatchEvent("textError", m);
            throw q;
          }
          c = [];
        }
        break;
      case Entry.Vim.PARSER_TYPE_PY_TO_BLOCK:
        try {
          var l = new Entry.PyAstGenerator, e = b.split("\n\n"), n;
          for (n in e) {
            h = e[n], -1 != h.search("import") ? e[n] = "" : (h = Entry.TextCodingUtil.prototype.entryEventFuncFilter(h), e[n] = h);
          }
          f = [];
          for (g in e) {
            h = e[g], k = l.generate(h), "Program" == k.type && 0 != k.body.length && f.push(k);
          }
          c = this._parser.Program(f);
          this._parser._variableMap.clear();
        } catch (q) {
          if (this.codeMirror) {
            throw q instanceof SyntaxError ? (b = {from:{line:q.loc.line - 1, ch:q.loc.column - 2}, to:{line:q.loc.line - 1, ch:q.loc.column + 1}}, q.message = "\ubb38\ubc95 \uc624\ub958\uc785\ub2c8\ub2e4.") : (b = this.getLineNumber(q.node.start, q.node.end), b.message = q.message, b.severity = "error"), m = parseInt(b.to.line) + 1, b.from.line = m - 1, b.to.line = m, this.codeMirror.markText(b.from, b.to, {className:"CodeMirror-lint-mark-error", __annotation:b, clearOnEnter:!0}), b = q.title ? 
            q.title : "\ubb38\ubc95 \uc624\ub958", m = q.message && m ? q.message + " (line: " + m + ")" : "\ud30c\uc774\uc36c \ucf54\ub4dc\ub97c \ud655\uc778\ud574\uc8fc\uc138\uc694", Entry.toast.alert(b, m), q;
          }
          c = [];
        }
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_JS:
        c = m = this._parser.Code(b, a);
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_PY:
        m = this._parser.Code(b, a), this._pyHinter || (this._pyHinter = new Entry.PyHint), c = m;
    }
    return c;
  };
  a.getLineNumber = function(b, a) {
    var c = this.codeMirror.getValue(), e = {from:{}, to:{}};
    b = c.substring(0, b).split(/\n/gi);
    e.from.line = b.length - 1;
    e.from.ch = b[b.length - 1].length;
    a = c.substring(0, a).split(/\n/gi);
    e.to.line = a.length - 1;
    e.to.ch = a[a.length - 1].length;
    return e;
  };
  a.mappingSyntax = function(b) {
    for (var a = Object.keys(Entry.block), d = {}, e = 0;e < a.length;e++) {
      var f = a[e], g = Entry.block[f];
      if (b === Entry.Vim.MAZE_MODE) {
        if (-1 < this.availableCode.indexOf(f) && (g = g.syntax)) {
          for (var h = d, k = 0;k < g.length;k++) {
            var m = g[k];
            if (!(-1 < m.indexOf("%"))) {
              var l = m.indexOf("(");
              -1 < l && (m = m.substring(0, l));
              if (k === g.length - 2 && "function" === typeof g[k + 1]) {
                h[m] = g[k + 1];
                break;
              }
              h[m] || (h[m] = {});
              k === g.length - 1 ? h[m] = f : h = h[m];
            }
          }
        }
      } else {
        if (b === Entry.Vim.WORKSPACE_MODE) {
          for (m in f = Entry.block, f) {
            g = f[m], h = null, g.syntax && g.syntax.py && (h = g.syntax.py), h && (h = String(h), g = h.split("("), 0 != g[0].length && (h = g[0]), d[h] = m);
          }
        }
      }
    }
    return d;
  };
  a.setAvailableCode = function(b, a) {
    var c = [], e;
    b instanceof Entry.Code ? e = b.getBlockList() : b.forEach(function(b, a) {
      e.concat(b);
    });
    e.forEach(function(b) {
      c.push(b.type);
    });
    e = [];
    a instanceof Entry.Code ? e = a.getBlockList() : a.forEach(function(b, a) {
      e.concat(b);
    });
    e.forEach(function(b) {
      -1 === c.indexOf(b.type) && c.push(b.type);
    });
    this.availableCode = this.availableCode.concat(c);
  };
  a.findErrorInfo = function(b) {
    var a = 0, d = 0, e = this.codeMirror.getValue().split("\n"), f;
    for (f in e) {
      var g = e[f].trim();
      a++;
      if (!(0 == g.length || 1 == g.length || -1 < g.indexOf("else")) && (d++, d == b.blockCount)) {
        break;
      }
    }
    return {lineNumber:a - a, location:b.node};
  };
})(Entry.Parser.prototype);
Entry.PyBlockAssembler = function(a) {
  this.blockSyntax = a;
  this._blockStatmentIndex = 0;
  this._blockStatments = [];
};
(function(a) {
  a.Program = function(b) {
    var a = [], d;
    for (d in b) {
      if ("Program" != b[d].type) {
        return;
      }
      var e = [], f = b[d].body;
      console.log("nodes", f);
      for (d in f) {
        var g = f[d], g = this[g.type](g);
        console.log("checkitout", g);
        g = this._assembler[g.type](g);
        e.push(g);
      }
      console.log("thread", e);
      a.push(e);
    }
    return a;
  };
  a.ExpressionStatement = function(b) {
    console.log("ExpressionStatement component", b);
    var a = {};
    b = b.expression;
    "Literal" == b.type ? (b = this[b.type]({type:"Block", accept:"booleanMagnet"}, b), a.type = b.type, result = a, console.log("ExpressionStatement type literal", result)) : (b = this[b.type](b), a.type = b.type, a.params = b.params, result = a, console.log("ExpressionStatement type not literal", result));
    console.log("ExpressionStatement result", result);
    return result;
  };
  a.AssignmentExpression = function(b) {
    console.log("AssignmentExpression component", b);
    var a = [], d;
    d = b.left;
    d.type ? ("Literal" == d.type ? (d = this[d.type](paramsMeta[0], d), console.log("AssignmentExpression left Literal param", d)) : d = this[d.type](d), d && a.push(d), console.log("AssignmentExpression left param", d)) : (d = b.left, this[d.type](d));
    operator = String(b.operator);
    console.log("AssignmentExpression operator", operator);
    operator && (d = operator = Entry.TextCodingUtil.prototype.logicalExpressionConvert(operator), a.push(d));
    d = b.right;
    d.type ? ("Literal" == d.type ? (d = this[d.type](paramsMeta[2], d), console.log("AssignmentExpression right Literal param", d)) : d = this[d.type](d), d && a.push(d), console.log("AssignmentExpression right param", d)) : (d = b.right, this[d.type](d));
    console.log("AssignmentExpression params", a);
    console.log("AssignmentExpression result", result);
    return result;
  };
  a.CallExpression = function(b) {
    console.log("CallExpression component", b);
    var a;
    a = {};
    var d = b.callee, d = this[d.type](d);
    console.log("CallExpression calleeData", d, "calleeData typeof", typeof d);
    var e = "object" != typeof d.object ? String(d.object).concat(".").concat(String(d.property)) : String(d.object.object).concat(".").concat(String(d.object.property)).concat(".").concat(String(d.property));
    console.log("CallExpression syntax", e);
    d = this.getBlockType(e);
    console.log("CallExpression type1", d);
    d || "__pythonRuntime.functions.range" == e && (d = "repeat_basic");
    console.log("CallExpression type2", d);
    e = Entry.block[d].params;
    console.log("CallExpression paramsMeta", e);
    var arguments = b.arguments, f = [], g;
    for (g in arguments) {
      var h = arguments[g];
      console.log("CallExpression argument", h);
      if ("Literal" == h.type) {
        var k = e[g];
        "Indicator" == k.type ? (h = null, f.push(h), g--) : (console.log("CallExpression argument index", h.type, g), h = this[h.type](k, h, d, g), f.push(h));
        g == arguments.length - 1 && (console.log("CallExpression in1"), g < e.length && (console.log("CallExpression in2"), f.push(null)));
        console.log("CallExpression i", g);
      }
    }
    console.log("CallExpression params", f);
    a.type = d;
    a.params = f;
    console.log("CallExpression result", a);
    return a;
  };
  a.Literal = function(b, a, d, e) {
    console.log("Literal paramMeta component particularIndex blockType", b, a, d, e);
    a = a.value;
    b = d ? this["Param" + b.type](b, a, d, e) : this["Param" + b.type](b, a);
    console.log("Literal result", b);
    return b;
  };
  a.ParamColor = function(b, a) {
    console.log("ParamColor paramMeta value", b, a);
    console.log("ParamColor result", a);
    return a;
  };
  a.ParamDropdown = function(b, a) {
    console.log("ParamDropdown paramMeta value", b, a);
    console.log("ParamDropdownDynamic result", a);
    return a;
  };
  a.ParamDropdownDynamic = function(b, a) {
    console.log("ParamDropdownDynamic paramMeta value", b, a);
    var c;
    if ("mouse" == a) {
      return "mouse";
    }
    b = b.options;
    for (var e in b) {
      if (console.log("options", b), a == b[e][0]) {
        console.log("options[i][0]", b[e][0]);
        c = b[e][1];
        break;
      }
    }
    console.log("ParamDropdownDynamic result", c);
    return c;
  };
  a.ParamKeyboard = function(b, a) {
    console.log("ParamKeyboard paramMeta value", b, a);
    b = Entry.KeyboardCodeMap.prototype.keyCharToCode[a];
    console.log("ParamKeyboard result", b);
    return b;
  };
  a.ParamBlock = function(b, a, d, e) {
    console.log("ParamBlock paramMeta value blockType", b, a, d, e);
    var c = {}, g = [];
    d = Entry.TextCodingUtil.prototype.particularParam(d);
    if (null != d) {
      var h = d[e];
      if (h) {
        h = d[e];
        console.log("ParamBlock particularType", h);
        e = h;
        c.type = e;
        d = Entry.block[e].params;
        console.log("ParamBlock particular block paramsMeta", b);
        var k, m;
        for (m in d) {
          b = d[m];
          b = b.options;
          for (var l in b) {
            h = b[l], a == h[0] && (k = h[1]);
          }
        }
        g.push(k);
        c.params = g;
      } else {
        switch(e = typeof a, e) {
          case "number":
            c.type = "number";
            g.push(a);
            c.params = g;
            break;
          case "boolean":
            1 == a ? c.type = "True" : 0 == a && (c.type = "False");
            break;
          default:
            c.type = "text", g.push(a), c.params = g;
        }
      }
    } else {
      switch(e = typeof a, e) {
        case "number":
          c.type = "number";
          g.push(a);
          c.params = g;
          break;
        case "boolean":
          1 == a ? c.type = "True" : 0 == a && (c.type = "False");
          break;
        default:
          c.type = "text", g.push(a), c.params = g;
      }
    }
    console.log("ParamBlock valueType", e);
    console.log("ParamBlock result", c);
    return c;
  };
  a.Indicator = function(b, a, d) {
  };
  a.MemberExpression = function(b) {
    console.log("MemberExpression component", b);
    var a = {}, d = b.object;
    b = b.property;
    d = this[d.type](d);
    b = this[b.type](b);
    console.log("MemberExpression objectData", d);
    console.log("MemberExpression structure", b);
    a.object = d;
    a.property = b;
    console.log("MemberExpression result", a);
    return a;
  };
  a.Identifier = function(b) {
    console.log("Identifiler component", b);
    b = b.name;
    console.log("Identifiler result", b);
    return b;
  };
  a.WhileStatement = function(b) {
    console.log("WhileStatement component", b);
    var a = {}, d = b.test, e;
    1 == d.value && (e = this.getBlockType("while True:\n$1"));
    console.log("WhileStatement type", e);
    var f = Entry.block[e].params;
    console.log("WhileStatement paramsMeta", f);
    var g = [];
    d && (d.type = "Literal", f = f[0], d = "Indicator" == f.type ? null : this[d.type](f, d), g.push(d));
    d = [];
    b = b.body.body;
    for (var h in b) {
      f = b[h], f = this[f.type](f), d.push(f);
    }
    a.type = e;
    a.params = g;
    a.statements = [];
    a.statements.push(d);
    console.log("WhileStatement result", a);
    return a;
  };
  a.BlockStatement = function(b) {
    console.log("BlockStatement component", b);
    this._blockStatmentIndex = 0;
    this._blockStatments = [];
    var a = {};
    b = b.body;
    for (var d in b) {
      var e = b[d];
      console.log("BlockStatement body", e, "i", d);
      e = this[e.type](e);
      console.log("BlockStatement bodyData", e, "i", d);
      if (e.declarations) {
        console.log("BlockStatement statements type params bodyData", d, e);
        var e = e.declarations, f;
        for (f in e) {
          var g = e[f];
          g.init.type && (a.type = g.init.type);
          g.init.params && (console.log("BlockStatement params", g.init.params), a.params = g.init.params);
          console.log("BlockStatement structure", a, "j", f);
        }
      } else {
        0 == this._blockStatmentIndex && this._blockStatments.push(e);
      }
    }
    a.statements = [this._blockStatments];
    console.log("BlockStatement result", a);
    this._blockStatmentIndex++;
    return a;
  };
  a.IfStatement = function(b) {
    console.log("IfStatement component", b);
    var a = {}, d = [], e = [], f = [], g = [], h = b.test, k = b.alternate, m = b.consequent;
    b = this.getBlockType(null == k ? "if %1:\n$1" : "if %1:\n$1\nelse:\n$2");
    if (null != h) {
      var l = Entry.block[b].params;
      console.log("IfStatement paramsMeta", l);
      d = [];
      h.type = "Literal";
      l = l[0];
      h = "Indicator" == l.type ? null : this[h.type](l, h);
      d.push(h);
    }
    if (null != m) {
      for (var n in m.body) {
        if (h = m.body[n]) {
          h = this[h.type](h), console.log("IfStatement consequent bodyData", h), e.push(h);
        }
      }
    }
    if (null != k) {
      for (n in k.body) {
        if (h = k.body[n]) {
          h = this[h.type](h), console.log("IfStatement alternate bodyData", h), f.push(h);
        }
      }
    }
    0 != e.length && g.push(e);
    0 != f.length && g.push(f);
    a.type = b;
    0 != d.length && (a.params = d);
    0 != g.length && (a.statements = g);
    console.log("IfStatement result", a);
    return a;
  };
  a.VariableDeclaration = function(b) {
    console.log("VariableDeclaration component", b);
    var a = {}, d = [];
    b = b.declarations;
    for (var e in b) {
      var f = b[e], f = this[f.type](f);
      console.log("VariableDeclaration declarationData", f);
      d.push(f);
    }
    a.declarations = d;
    console.log("VariableDeclaration result", a);
    return a;
  };
  a.VariableDeclarator = function(b) {
    console.log("VariableDeclarator component", b);
    var a = {}, d = b.id, e = this[d.type](d);
    console.log("VariableDeclarator idData", e);
    b = b.init;
    b = this[b.type](b);
    console.log("VariableDeclarator initData", b);
    a.id = d;
    a.init = b;
    console.log("VariableDeclarator result", a);
    return a;
  };
  a.BreakStatement = function(b) {
    console.log("BreakStatement component", b);
    b = {};
    var a = this.getBlockType("break");
    b.type = a;
    console.log("BreakStatement result", b);
    return b;
  };
  a.UnaryExpression = function(b) {
    console.log("UnaryExpression component", b);
    var a = [];
    b.prefix && (b = b.operator.concat(b.argument.value), a.push(b));
    result.params = a;
    console.log("UnaryExpression result", result);
    return result;
  };
  a.LogicalExpression = function(b) {
    console.log("LogicalExpression component", b);
    var a = {}, d = String(b.operator);
    switch(d) {
      case "&&":
        var e = "%1 and %3";
        break;
      case "||":
        e = "%1 or %3";
        break;
      default:
        e = "%1 and %3";
    }
    var e = this.getBlockType(e), f = Entry.block[e].params;
    console.log("LogicalExpression paramsMeta", f);
    var g = [], d = b.left;
    d.type ? ("Literal" == d.type ? (d = this[d.type](f[0], d), console.log("LogicalExpression left Literal param", d)) : d = this[d.type](d), d && g.push(d), console.log("LogicalExpression left param", d)) : (d = b.left, this[d.type](d));
    d = String(b.operator);
    console.log("LogicalExpression operator", d);
    d && (d = Entry.TextCodingUtil.prototype.logicalExpressionConvert(d), g.push(d));
    d = b.right;
    d.type ? ("Literal" == d.type ? (d = this[d.type](f[2], d), console.log("LogicalExpression right Literal param", d)) : d = this[d.type](d), d && g.push(d), console.log("LogicalExpression right param", d)) : (d = b.right, this[d.type](d));
    a.type = e;
    a.params = g;
    console.log("LogicalExpression result", a);
    return a;
  };
  a.BinaryExpression = function(b) {
    console.log("BinaryExpression component", b);
    var a = {params:[]}, d = String(b.operator);
    console.log("BinaryExpression operator", d);
    if (d) {
      var e = "(%1 %2 %3)";
    }
    console.log("BinaryExpression syntax", e);
    e = this.getBlockType(e);
    console.log("BinaryExpression type", e);
    var f = Entry.block[e].params;
    console.log("BinaryExpression paramsMeta", f);
    var g = [], d = b.left;
    d.type ? ("Literal" == d.type ? (d = this[d.type](f[0], d), console.log("BinaryExpression left Literal param", d)) : d = this[d.type](d), d && g.push(d), console.log("BinaryExpression left param", d)) : (d = b.left, this[d.type](d));
    if (d = String(b.operator)) {
      console.log("BinaryExpression operator", d), (d = Entry.TextCodingUtil.prototype.binaryOperatorConvert(d)) && g.push(d);
    }
    d = b.right;
    d.type ? ("Literal" == d.type ? (d = this[d.type](f[2], d), console.log("BinaryExpression right Literal param", d)) : d = this[d.type](d), d && g.push(d), console.log("BinaryExpression right param", d)) : (d = b.right, this[d.type](d));
    console.log("BinaryExpression params", g);
    a.type = e;
    a.params = g;
    console.log("BinaryExpression result", a);
    return a;
  };
  a.getBlockType = function(b) {
    return this.blockSyntax[b];
  };
  a.FunctionDeclaration = function(b) {
    console.log("FunctionDeclaration component", b);
    console.log("FunctionDeclaration result", void 0);
    return b;
  };
  a.RegExp = function(b) {
    console.log("RegExp", b);
    console.log("RegExp result", void 0);
    return b;
  };
  a.Function = function(b) {
    console.log("Function", b);
    console.log("Function result", void 0);
    return b;
  };
  a.EmptyStatement = function(b) {
    console.log("EmptyStatement", b);
    console.log("EmptyStatement result", void 0);
    return b;
  };
  a.DebuggerStatement = function(b) {
    console.log("DebuggerStatement", b);
    console.log("DebuggerStatement result", void 0);
    return b;
  };
  a.WithStatement = function(b) {
    console.log("WithStatement", b);
    console.log("WithStatement result", void 0);
    return b;
  };
  a.ReturnStaement = function(b) {
    console.log("ReturnStaement", b);
    console.log("ReturnStaement result", void 0);
    return b;
  };
  a.LabeledStatement = function(b) {
    console.log("LabeledStatement", b);
    console.log("LabeledStatement result", void 0);
    return b;
  };
  a.BreakStatement = function(b) {
    console.log("BreakStatement", b);
    console.log("BreakStatement result", void 0);
    return b;
  };
  a.ContinueStatement = function(b) {
    console.log("ContinueStatement", b);
    console.log("ContinueStatement result", void 0);
    return b;
  };
  a.SwitchStatement = function(b) {
    console.log("SwitchStatement", b);
    console.log("SwitchStatement result", void 0);
    return b;
  };
  a.SwitchCase = function(b) {
    console.log("SwitchCase", b);
    console.log("SwitchCase result", void 0);
    return b;
  };
  a.ThrowStatement = function(b) {
    console.log("ThrowStatement", b);
    console.log("ThrowStatement result", void 0);
    return b;
  };
  a.TryStatement = function(b) {
    console.log("TryStatement", b);
    console.log("TryStatement result", void 0);
    return b;
  };
  a.CatchClause = function(b) {
    console.log("CatchClause", b);
    console.log("CatchClause result", void 0);
    return b;
  };
  a.DoWhileStatement = function(b) {
    console.log("DoWhileStatement", b);
    console.log("DoWhileStatement result", void 0);
    return b;
  };
  a.ForInStatement = function(b) {
    console.log("ForInStatement", b);
    console.log("ForInStatement result", void 0);
    return b;
  };
  a.FunctionDeclaration = function(b) {
    console.log("FunctionDeclaration", b);
    console.log("FunctionDeclaration result", void 0);
    return b;
  };
  a.ThisExpression = function(b) {
    console.log("ThisExpression", b);
    console.log("ThisExpression result", void 0);
    return b;
  };
  a.ArrayExpression = function(b) {
    console.log("ArrayExpression", b);
    console.log("ArrayExpression result", void 0);
    return b;
  };
  a.ObjectExpression = function(b) {
    console.log("ObjectExpression", b);
    console.log("ObjectExpression result", void 0);
    return b;
  };
  a.Property = function(b) {
    console.log("Property", b);
    console.log("Property result", void 0);
    return b;
  };
  a.FunctionExpression = function(b) {
    console.log("FunctionExpression", b);
    console.log("FunctionExpression result", void 0);
    return b;
  };
  a.UpdateExpression = function(b) {
    console.log("UpdateExpression", b);
    console.log("UpdateExpression result", void 0);
    return b;
  };
  a.ConditionalExpression = function(b) {
    console.log("ConditionalExpression", b);
    console.log("ConditionalExpression result", void 0);
    return b;
  };
  a.NewExpression = function(b) {
    console.log("NewExpression", b);
    console.log("NewExpression result", void 0);
    return b;
  };
  a.SequenceExpression = function(b) {
    console.log("SequenceExpression", b);
    console.log("SequenceExpression result", void 0);
    return b;
  };
})(Entry.PyBlockAssembler.prototype);
Entry.PyToBlockParserTemp = function(a) {
  this._assembler = new Entry.PyBlockAssembler(a);
};
(function(a) {
  a.Program = function(b) {
    var a = [], d;
    for (d in b) {
      if ("Program" != b[d].type) {
        return;
      }
      var e = [], f = b[d].body;
      console.log("nodes", f);
      for (d in f) {
        var g = f[d], g = this[g.type](g);
        console.log("checkitout", g);
        g = this._assembler[g.type](g);
        e.push(g);
      }
      console.log("thread", e);
      a.push(e);
    }
    return a;
  };
  a.Identifier = function(b) {
    console.log("Identifier", b);
    return {type:b.type, name:b.name};
  };
  a.FunctionDeclaration = function(b) {
    console.log("FunctionDeclaration", b);
    var a = this[b.id.type](b.id);
    return {type:b.type, id:a};
  };
  a.Literal = function(b) {
    console.log("Literal", b);
    console.log("typeof node at Literal", typeof b.value);
    var a;
    "string" === typeof b.value ? a = b.value : "boolean" === typeof b.value ? a = b.value : "number" === typeof b.value ? a = b.value : "RegExp" === typeof b.value ? (a = this[typeof b.value](b), a = a.regex.pattern) : a = null;
    console.log("value", a);
    return {type:b.type, value:a};
  };
  a.RegExp = function(b) {
    console.log("RegExp", b);
    return {regex:b.regex};
  };
  a.Function = function(b) {
    console.log("Function", b);
    var a = this[b.id](b), d = [], e;
    for (e in b.params) {
      d.push(b.params[e]);
    }
    b = this[b.body](b);
    return {id:a, params:d, body:b};
  };
  a.ExpressionStatement = function(b) {
    var a = this[b.expression.type](b.expression);
    return {type:b.type, expression:a};
  };
  a.BlockStatement = function(b) {
    console.log("BlockStatement", b);
    var a = [], d;
    for (d in b.body) {
      var e = b.body[d];
      console.log("BlockStatement statement", e);
      e = this[e.type](e);
      console.log("BlockStatement body", e);
      a.push(e);
    }
    console.log("bodies", a);
    return {type:b.type, body:a};
  };
  a.EmptyStatement = function(b) {
    console.log("EmptyStatement", b);
    return {type:b.type};
  };
  a.DebuggerStatement = function(b) {
    console.log("DebuggerStatement", b);
    return {type:b.type};
  };
  a.WithStatement = function(b) {
    console.log("WithStatement", b);
    var a = this[b.object.type](b.object), d = this[b.body.type](b.body);
    return {type:b.type, object:a, body:d};
  };
  a.ReturnStaement = function(b) {
    console.log("ReturnStaement", b);
    var a;
    a = null === b.argument ? null : this[b.argument.type](b.argument);
    return {type:b.type, argument:a};
  };
  a.LabeledStatement = function(b) {
    console.log("LabeledStatement", b);
    var a = this[b.label.type](b.label), d = this[b.body.type](b.body);
    return {type:b.type, label:a, body:d};
  };
  a.BreakStatement = function(b) {
    console.log("BreakStatement", b);
    var a;
    console.log("node.label", b.label);
    b.label && null !== b.label ? (console.log("node.label2", b.label), a = this[b.label.type](b.label)) : (console.log("node.lable1", b.label), a = null);
    console.log("label", a);
    return {type:b.type, label:a};
  };
  a.ContinueStatement = function(b) {
    console.log("ContinueStatement", b);
    var a;
    a = null === b.label ? null : this[b.label.type](b.label);
    return {type:b.type, label:a};
  };
  a.IfStatement = function(b) {
    console.log("IfStatement", b);
    var a = this[b.test.type](b.test), d = {body:[]};
    if (null === b.alternate) {
      d = null;
    } else {
      for (var e in b.alternate.body) {
        var f = b.alternate.body[e], g = this[f.type](f);
        d.body.push(g);
      }
    }
    g = {body:[]};
    for (e in b.consequent.body) {
      f = b.consequent.body[e], f = this[f.type](f), g.body.push(f);
    }
    console.log("alternate", d);
    console.log("consequent", g);
    return {type:b.type, test:a, consequent:g, alternate:d};
  };
  a.SwitchStatement = function(b) {
    console.log("SwitchStatement", b);
    var a = this[b.discriminant.type](b.discriminant), d = [], e;
    for (e in b.cases) {
      var f = b.cases[e], f = this[f.type](f);
      d.push(f);
    }
    return {type:b.type, discriminant:a, cases:d};
  };
  a.SwitchCase = function(b) {
    console.log("SwitchCase", b);
    var a;
    a = null === b.test ? null : this[b.test.type](b.test);
    for (var d in b.consequent) {
      b = this[statment.type](statment), (void 0).push(b);
    }
    return {test:a, consequent:void 0};
  };
  a.ThrowStatement = function(b) {
    console.log("ThrowStatement", b);
    var a = this[b.argument.type](b.argument);
    return {type:b.type, argument:a};
  };
  a.TryStatement = function(b) {
    console.log("TryStatement", b);
    var a = this[b.block.type](b.block), d;
    d = null === b.handler ? null : this[b.handler.type](b.handler);
    var e;
    e = null === b.finalizer ? null : this[b.finalizer.type](b.finalizer);
    return {type:b.type, block:a, handler:d, finalizer:e};
  };
  a.CatchClause = function(b) {
    console.log("CatchClause", b);
    var a = b.param;
    b = this[b.body.type](b.body);
    return {param:a, body:b};
  };
  a.WhileStatement = function(b) {
    console.log("WhileStatement", b);
    var a = this[b.test.type](b.test), d = this[b.body.type](b.body);
    console.log("WhileStatement test", a);
    console.log("WhileStatement body", d);
    return {type:b.type, test:a, body:d};
  };
  a.DoWhileStatement = function(b) {
    console.log("DoWhileStatement", b);
    var a;
    a = this[b.init.type](b.init);
    var d;
    d = null === b.test ? null : this[b.test.type](b.test);
    var e;
    e = null === b.update ? null : this[b.update.type](b.update);
    var f = this[b.body.type](b.body);
    return {type:b.type, init:a, test:d, update:e, body:f};
  };
  a.ForStatement = function(b) {
    console.log("ForStatement", b);
    var a;
    if (null === b.init) {
      a = null;
    } else {
      this[b.init.type](b.init);
    }
    var d;
    d = null === b.test ? null : this[b.test.type](b.test);
    var e;
    e = null === b.update ? null : this[b.update.type](b.update);
    var f = this[b.body.type](b.body);
    console.log("ForStatement body", f);
    return {type:b.type, init:a, test:d, update:e, body:f};
  };
  a.ForInStatement = function(b) {
    console.log("ForInStatement", b);
    var a;
    a = this[b.left.type](b.left);
    var d = this[b.right.type](b.right), e = this[b.body.type](b.body);
    return {type:b.type, left:a, right:d, body:e};
  };
  a.FunctionDeclaration = function(b) {
    console.log("FunctionDeclaration", b);
    return {id:this[b.id.type](b.id)};
  };
  a.VariableDeclaration = function(b) {
    console.log("VariableDeclaration", b);
    var a = [], d;
    for (d in b.declarations) {
      var e = b.declarations[d], e = this[e.type](e);
      console.log("declaration", e);
      a.push(e);
    }
    console.log("VariableDeclaration declarations", a);
    return {type:b.type, declarations:a, kind:"var"};
  };
  a.VariableDeclarator = function(b) {
    console.log("VariableDeclarator", b);
    var a = this[b.id.type](b.id), d;
    d = null === b.init ? null : this[b.init.type](b.init);
    console.log("id", a);
    console.log("init", d);
    return {type:b.type, id:a, init:d};
  };
  a.ThisExpression = function(b) {
    console.log("ThisExpression", b);
    return {type:b.type};
  };
  a.ArrayExpression = function(b) {
    console.log("ArrayExpression", b);
    var a;
    if (null === b.elements) {
      a = null;
    } else {
      for (var d in b.elements) {
        var e = b.elements[d], e = this[e.type](e);
        a.push(e);
      }
    }
    return {type:b.type, elements:a};
  };
  a.ObjectExpression = function(b) {
    console.log("ObjectExpression", b);
    for (var a in b.properties) {
      var d = b.properties[a], d = this[d.type](d);
      (void 0).push(d);
    }
    return {type:b.type, properties:void 0};
  };
  a.Property = function(b) {
    console.log("Property", b);
    var a = this[b.key.type](b.key), d = this[b.value.type](b.value);
    return {type:b.type, key:a, value:d, kind:b.kind};
  };
  a.FunctionExpression = function(b) {
    console.log("FunctionExpression", b);
    return {type:b.type};
  };
  a.UnaryExpression = function(b) {
    console.log("UnaryExpression", b);
    var a;
    switch(b.operator) {
      case "-":
        a = b.operator;
        break;
      case "+":
        a = b.operator;
        break;
      case "!":
        a = b.operator;
        break;
      case "~":
        a = b.operator;
        break;
      case "typeof":
        a = b.operator;
        break;
      case "void":
        a = b.operator;
        break;
      case "delete":
        a = b.operator;
        break;
      default:
        a = null;
    }
    var d = b.prefix, e = this[b.argument.type](b.argument);
    return {type:b.type, operator:a, prefix:d, argument:e};
  };
  a.UpdateExpression = function(b) {
    console.log("UpdateExpression", b);
    var a;
    switch(b.operator) {
      case "++":
        a = b.operator;
        break;
      case "--":
        a = b.operator;
        break;
      default:
        a = null;
    }
    var d = this[b.argument.type](b.argument);
    return {type:b.type, operator:a, prefix:b.prefix, argument:d};
  };
  a.BinaryExpression = function(b) {
    console.log("BinaryExpression", b);
    var a;
    switch(b.operator) {
      case "==":
        a = b.operator;
        break;
      case "!=":
        a = b.operator;
        break;
      case "===":
        a = b.operator;
        break;
      case "!==":
        a = b.operator;
        break;
      case "<":
        a = b.operator;
        break;
      case "<=":
        a = b.operator;
        break;
      case ">":
        a = b.operator;
        break;
      case ">=":
        a = b.operator;
        break;
      case "<<":
        a = b.operator;
        break;
      case ">>":
        a = b.operator;
        break;
      case ">>>":
        a = b.operator;
        break;
      case "+":
        a = b.operator;
        break;
      case "-":
        a = b.operator;
        break;
      case "*":
        a = b.operator;
        break;
      case "/":
        a = b.operator;
        break;
      case "%":
        a = b.operator;
        break;
      case "|":
        a = b.operator;
        break;
      case "^":
        a = b.operator;
        break;
      case "|":
        a = b.operator;
        break;
      case "&":
        a = b.operator;
        break;
      case "in":
        a = b.operator;
        break;
      case "instanceof":
        a = b.operator;
        break;
      default:
        a = null;
    }
    var d = this[b.left.type](b.left), e = this[b.right.type](b.right);
    return {type:b.type, operator:a, left:d, right:e};
  };
  a.AssignmentExpression = function(b) {
    console.log("AssignmentExpression", b);
    var a;
    switch(b.operator) {
      case "=":
        a = b.operator;
        break;
      case "+=":
        a = b.operator;
        break;
      case "-=":
        a = b.operator;
        break;
      case "*=":
        a = b.operator;
        break;
      case "/=":
        a = b.operator;
        break;
      case "%=":
        a = b.operator;
        break;
      case "<<=":
        a = b.operator;
        break;
      case ">>=":
        a = b.operator;
        break;
      case "|=":
        a = b.operator;
        break;
      case "^=":
        a = b.operator;
        break;
      case "&=":
        a = b.operator;
        break;
      default:
        a = null;
    }
    var d;
    d = b.left;
    var e = this[b.right.type](b.right);
    return {type:b.type, operator:a, left:d, right:e};
  };
  a.LogicalExpression = function(b) {
    console.log("LogicalExpression", b);
    var a;
    switch(b.operator) {
      case "||":
        a = b.operator;
        break;
      case "&&":
        a = b.operator;
        break;
      default:
        a = null;
    }
    var d = this[b.left.type](b.left), e = this[b.right.type](b.right);
    return {type:b.type, operator:a, left:d, right:e};
  };
  a.MemberExpression = function(b) {
    console.log("MemberExpression", b);
    var a = this[b.object.type](b.object), d = this[b.property.type](b.property), e = b.computed;
    console.log("object", a);
    console.log("property", d);
    return {type:b.type, object:a, property:d, computed:e};
  };
  a.ConditionalExpression = function(b) {
    console.log("ConditionalExpression", b);
    var a = this[b.callee.type](b.callee), d;
    for (d in b.arguments) {
      var e = b.arguments[d], e = this[e.type](e);
      (void 0).push(e);
    }
    return {type:b.type, callee:a, arguments:void 0};
  };
  a.CallExpression = function(b) {
    console.log("CallExpression", b);
    var a = this[b.callee.type](b.callee), d = [], e;
    for (e in b.arguments) {
      var f = b.arguments[e], f = this[f.type](f);
      d.push(f);
    }
    console.log("callee", a);
    console.log("arguments", d);
    return {type:b.type, callee:a, arguments:d};
  };
  a.NewExpression = function(b) {
    console.log("NewExpression", b);
    return {type:b.type};
  };
  a.SequenceExpression = function(b) {
    console.log("SequenceExpression", b);
    for (var a in b.expressions) {
      var d = b.expressions[a], d = this[d.type](d);
      (void 0).push(d);
    }
    return {type:b.type, expressions:void 0};
  };
})(Entry.PyToBlockParserTemp.prototype);
Entry.Toast = function() {
  this.toasts_ = [];
  var a = document.getElementById("entryToastContainer");
  a && document.body.removeChild(a);
  this.body_ = Entry.createElement("div", "entryToastContainer");
  this.body_.addClass("entryToastContainer");
  document.body.appendChild(this.body_);
};
Entry.Toast.prototype.warning = function(a, b, c) {
  var d = Entry.createElement("div", "entryToast");
  d.addClass("entryToast");
  d.addClass("entryToastWarning");
  d.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = a;
  d.appendChild(e);
  a = Entry.createElement("p", "entryToast");
  a.addClass("entryToastMessage");
  a.innerHTML = b;
  d.appendChild(a);
  this.toasts_.push(d);
  this.body_.appendChild(d);
  c || window.setTimeout(function() {
    d.style.opacity = 1;
    var b = setInterval(function() {
      .05 > d.style.opacity && (clearInterval(b), d.style.display = "none", Entry.removeElement(d));
      d.style.opacity *= .9;
    }, 20);
  }, 1E3);
};
Entry.Toast.prototype.success = function(a, b, c) {
  var d = Entry.createElement("div", "entryToast");
  d.addClass("entryToast");
  d.addClass("entryToastSuccess");
  d.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = a;
  d.appendChild(e);
  a = Entry.createElement("p", "entryToast");
  a.addClass("entryToastMessage");
  a.innerHTML = b;
  d.appendChild(a);
  this.toasts_.push(d);
  this.body_.appendChild(d);
  c || window.setTimeout(function() {
    d.style.opacity = 1;
    var b = setInterval(function() {
      .05 > d.style.opacity && (clearInterval(b), d.style.display = "none", Entry.removeElement(d));
      d.style.opacity *= .9;
    }, 20);
  }, 1E3);
};
Entry.Toast.prototype.alert = function(a, b, c) {
  var d = Entry.createElement("div", "entryToast");
  d.addClass("entryToast");
  d.addClass("entryToastAlert");
  d.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = a;
  d.appendChild(e);
  a = Entry.createElement("p", "entryToast");
  a.addClass("entryToastMessage");
  a.innerHTML = b;
  d.appendChild(a);
  this.toasts_.push(d);
  this.body_.appendChild(d);
  c || window.setTimeout(function() {
    d.style.opacity = 1;
    var b = setInterval(function() {
      .05 > d.style.opacity && (clearInterval(b), d.style.display = "none", Entry.toast.body_.removeChild(d));
      d.style.opacity *= .9;
    }, 20);
  }, 5E3);
};
Entry.TvCast = function(a) {
  this.generateView(a);
};
p = Entry.TvCast.prototype;
p.init = function(a) {
  this.tvCastHash = a;
};
p.generateView = function(a) {
  var b = Entry.createElement("div");
  b.addClass("entryContainerMovieWorkspace");
  b.addClass("entryRemove");
  this.movieContainer = b;
  b = Entry.createElement("iframe");
  b.setAttribute("id", "tvCastIframe");
  b.setAttribute("allowfullscreen", "");
  b.setAttribute("frameborder", 0);
  b.setAttribute("src", a);
  this.movieFrame = b;
  this.movieContainer.appendChild(this.movieFrame);
};
p.getView = function() {
  return this.movieContainer;
};
p.resize = function() {
  document.getElementById("entryContainerWorkspaceId");
  var a = document.getElementById("tvCastIframe");
  w = this.movieContainer.offsetWidth;
  a.width = w + "px";
  a.height = 9 * w / 16 + "px";
};
Entry.ContextMenu = {};
(function(a) {
  a.visible = !1;
  a._hideEvent = null;
  a.createDom = function() {
    this.dom = Entry.Dom("ul", {id:"entry-contextmenu", parent:$("body")});
    this.dom.bind("mousedown touchstart", function(b) {
      b.stopPropagation();
    });
    Entry.Utils.disableContextmenu(this.dom);
  };
  a.show = function(b, a, d) {
    this._hideEvent = Entry.documentMousedown.attach(this, function() {
      this.hide();
    });
    this.dom || this.createDom();
    if (0 !== b.length) {
      var c = this;
      void 0 !== a && (this._className = a, this.dom.addClass(a));
      var f = this.dom;
      f.empty();
      for (var g = 0, h = b.length;g < h;g++) {
        var k = b[g], m = k.text, l = !1 !== k.enable, n = Entry.Dom("li", {parent:f});
        k.divider ? a = "divider" : (a = l ? "menuAble" : "menuDisable", Entry.Dom("span", {parent:n}).text(m), l && k.callback && function(b, a) {
          b.mousedown(function(b) {
            b.preventDefault();
            c.hide();
            a(b);
          });
        }(n, k.callback));
        n.addClass(a);
      }
      f.removeClass("entryRemove");
      this.visible = !0;
      this.position(d || Entry.mouseCoordinate);
    }
  };
  a.position = function(b) {
    var a = this.dom;
    a.css({left:0, top:0});
    var d = a.width(), e = a.height(), f = $(window), g = f.width(), f = f.height();
    b.x + d > g && (b.x -= d + 3);
    b.y + e > f && (b.y -= e);
    a.css({left:b.x, top:b.y});
  };
  a.hide = function() {
    this.visible = !1;
    this.dom.empty();
    this.dom.addClass("entryRemove");
    this._className && (this.dom.removeClass(this._className), delete this._className);
    this._hideEvent && (Entry.documentMousedown.detach(this._hideEvent), this._hideEvent = null);
  };
})(Entry.ContextMenu);
Entry.Loader = {queueCount:0, totalCount:0, loaded:!1};
Entry.Loader.addQueue = function(a) {
  this.queueCount || Entry.dispatchEvent("loadStart");
  this.queueCount++;
  this.totalCount++;
};
Entry.Loader.removeQueue = function(a) {
  this.queueCount--;
  this.queueCount || (this.totalCount = 0, this.handleLoad());
};
Entry.Loader.getLoadedPercent = function() {
  return 0 === this.totalCount ? 1 : this.queueCount / this.totalCount;
};
Entry.Loader.isLoaded = function() {
  return !this.queueCount && !this.totalCount;
};
Entry.Loader.handleLoad = function() {
  this.loaded || (this.loaded = !0, Entry.dispatchEvent("loadComplete"));
};
Entry.Variable = function(a) {
  Entry.assert("string" == typeof a.name, "Variable name must be given");
  this.name_ = a.name;
  this.id_ = a.id ? a.id : Entry.generateHash();
  this.type = a.variableType ? a.variableType : "variable";
  this.object_ = a.object || null;
  this.isCloud_ = a.isCloud || !1;
  this._valueWidth = this._nameWidth = null;
  var b = Entry.parseNumber(a.value);
  this.value_ = "number" == typeof b ? b : a.value ? a.value : 0;
  "slide" == this.type ? (this.setMinValue(a.minValue), this.setMaxValue(a.maxValue)) : "list" == this.type && (this.array_ = a.array ? a.array : []);
  a.isClone || (this.visible_ = a.visible || "boolean" == typeof a.visible ? a.visible : !0, this.x_ = a.x ? a.x : null, this.y_ = a.y ? a.y : null, "list" == this.type && (this.width_ = a.width ? a.width : 100, this.height_ = a.height ? a.height : 120, this.scrollPosition = 0), this.BORDER = 6, this.FONT = "10pt NanumGothic");
};
Entry.Variable.prototype.generateView = function(a) {
  var b = this.type;
  if ("variable" == b || "timer" == b || "answer" == b) {
    this.view_ = new createjs.Container, this.rect_ = new createjs.Shape, this.view_.addChild(this.rect_), this.view_.variable = this, this.wrapper_ = new createjs.Shape, this.view_.addChild(this.wrapper_), this.textView_ = new createjs.Text("asdf", this.FONT, "#000000"), this.textView_.textBaseline = "alphabetic", this.textView_.x = 4, this.textView_.y = 1, this.view_.addChild(this.textView_), this.valueView_ = new createjs.Text("asdf", "10pt NanumGothic", "#ffffff"), this.valueView_.textBaseline = 
    "alphabetic", b = Entry.variableContainer.variables_.length, this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (this.setX(-230 + 80 * Math.floor(b / 11)), this.setY(24 * a + 20 - 135 - 264 * Math.floor(b / 11))), this.view_.visible = this.visible_, this.view_.addChild(this.valueView_), this.view_.on("mousedown", function(b) {
      "workspace" == Entry.type && (this.offset = {x:this.x - (.75 * b.stageX - 240), y:this.y - (.75 * b.stageY - 135)}, this.cursor = "move");
    }), this.view_.on("pressmove", function(b) {
      "workspace" == Entry.type && (this.variable.setX(.75 * b.stageX - 240 + this.offset.x), this.variable.setY(.75 * b.stageY - 135 + this.offset.y), this.variable.updateView());
    });
  } else {
    if ("slide" == b) {
      var c = this;
      this.view_ = new createjs.Container;
      this.rect_ = new createjs.Shape;
      this.view_.addChild(this.rect_);
      this.view_.variable = this;
      this.wrapper_ = new createjs.Shape;
      this.view_.addChild(this.wrapper_);
      this.textView_ = new createjs.Text("name", this.FONT, "#000000");
      this.textView_.textBaseline = "alphabetic";
      this.textView_.x = 4;
      this.textView_.y = 1;
      this.view_.addChild(this.textView_);
      this.valueView_ = new createjs.Text("value", "10pt NanumGothic", "#ffffff");
      this.valueView_.textBaseline = "alphabetic";
      this.view_.on("mousedown", function(b) {
        "workspace" == Entry.type && (this.offset = {x:this.x - (.75 * b.stageX - 240), y:this.y - (.75 * b.stageY - 135)});
      });
      this.view_.on("pressmove", function(b) {
        "workspace" != Entry.type || c.isAdjusting || (this.variable.setX(.75 * b.stageX - 240 + this.offset.x), this.variable.setY(.75 * b.stageY - 135 + this.offset.y), this.variable.updateView());
      });
      this.view_.visible = this.visible_;
      this.view_.addChild(this.valueView_);
      b = this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26;
      b = Math.max(b, 90);
      this.maxWidth = b - 20;
      this.slideBar_ = new createjs.Shape;
      this.slideBar_.graphics.beginFill("#A0A1A1").s("#A0A1A1").ss(1).dr(10, 10, this.maxWidth, 1.5);
      this.view_.addChild(this.slideBar_);
      b = this.getSlidePosition(this.maxWidth);
      this.valueSetter_ = new createjs.Shape;
      this.valueSetter_.graphics.beginFill("#1bafea").s("#A0A1A1").ss(1).dc(b, 10.5, 3);
      this.valueSetter_.cursor = "pointer";
      this.valueSetter_.on("mousedown", function(b) {
        Entry.engine.isState("run") && (c.isAdjusting = !0, this.offsetX = -(this.x - .75 * b.stageX + 240));
      });
      this.valueSetter_.on("pressmove", function(b) {
        if (Entry.engine.isState("run")) {
          var a = this.offsetX;
          this.offsetX = -(this.x - .75 * b.stageX + 240);
          a !== this.offsetX && (b = c.getX(), c.setSlideCommandX(b + 10 > this.offsetX ? 0 : b + c.maxWidth + 10 > this.offsetX ? this.offsetX - b : c.maxWidth + 10));
        }
      });
      this.valueSetter_.on("pressup", function(b) {
        c.isAdjusting = !1;
      });
      this.view_.addChild(this.valueSetter_);
      b = Entry.variableContainer.variables_.length;
      this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (this.setX(-230 + 80 * Math.floor(b / 11)), this.setY(24 * a + 20 - 135 - 264 * Math.floor(b / 11)));
    } else {
      this.view_ = new createjs.Container, this.rect_ = new createjs.Shape, this.view_.addChild(this.rect_), this.view_.variable = this, this.titleView_ = new createjs.Text("asdf", this.FONT, "#000"), this.titleView_.textBaseline = "alphabetic", this.titleView_.textAlign = "center", this.titleView_.width = this.width_ - 2 * this.BORDER, this.titleView_.y = this.BORDER + 10, this.titleView_.x = this.width_ / 2, this.view_.addChild(this.titleView_), this.resizeHandle_ = new createjs.Shape, this.resizeHandle_.graphics.f("#1bafea").ss(1, 
      0, 0).s("#1bafea").lt(0, -9).lt(-9, 0).lt(0, 0), this.view_.addChild(this.resizeHandle_), this.resizeHandle_.list = this, this.resizeHandle_.on("mouseover", function(b) {
        this.cursor = "nwse-resize";
      }), this.resizeHandle_.on("mousedown", function(b) {
        this.list.isResizing = !0;
        this.offset = {x:.75 * b.stageX - this.list.getWidth(), y:.75 * b.stageY - this.list.getHeight()};
        this.parent.cursor = "nwse-resize";
      }), this.resizeHandle_.on("pressmove", function(b) {
        this.list.setWidth(.75 * b.stageX - this.offset.x);
        this.list.setHeight(.75 * b.stageY - this.offset.y);
        this.list.updateView();
      }), this.view_.on("mouseover", function(b) {
        this.cursor = "move";
      }), this.view_.on("mousedown", function(b) {
        "workspace" != Entry.type || this.variable.isResizing || (this.offset = {x:this.x - (.75 * b.stageX - 240), y:this.y - (.75 * b.stageY - 135)}, this.cursor = "move");
      }), this.view_.on("pressup", function(b) {
        this.cursor = "initial";
        this.variable.isResizing = !1;
      }), this.view_.on("pressmove", function(b) {
        "workspace" != Entry.type || this.variable.isResizing || (this.variable.setX(.75 * b.stageX - 240 + this.offset.x), this.variable.setY(.75 * b.stageY - 135 + this.offset.y), this.variable.updateView());
      }), this.elementView = new createjs.Container, b = new createjs.Text("asdf", this.FONT, "#000"), b.textBaseline = "middle", b.y = 5, this.elementView.addChild(b), this.elementView.indexView = b, b = new createjs.Shape, this.elementView.addChild(b), this.elementView.valueWrapper = b, b = new createjs.Text("fdsa", this.FONT, "#eee"), b.x = 24, b.y = 6, b.textBaseline = "middle", this.elementView.addChild(b), this.elementView.valueView = b, this.elementView.x = this.BORDER, this.scrollButton_ = 
      new createjs.Shape, this.scrollButton_.graphics.f("#aaa").rr(0, 0, 7, 30, 3.5), this.view_.addChild(this.scrollButton_), this.scrollButton_.y = 23, this.scrollButton_.list = this, this.scrollButton_.on("mousedown", function(b) {
        this.list.isResizing = !0;
        this.cursor = "pointer";
        this.offsetY = isNaN(this.offsetY) || 0 > this.offsetY ? b.rawY / 2 : this.offsetY;
      }), this.scrollButton_.on("pressmove", function(b) {
        void 0 === this.moveAmount ? (this.y = b.target.y, this.moveAmount = !0) : this.y = b.rawY / 2 - this.offsetY + this.list.height_ / 100 * 23;
        23 > this.y && (this.y = 23);
        this.y > this.list.getHeight() - 40 && (this.y = this.list.getHeight() - 40);
        this.list.updateView();
      }), this.scrollButton_.on("pressup", function(b) {
        this.moveAmount = void 0;
      }), this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (b = Entry.variableContainer.lists_.length, this.setX(110 * -Math.floor(b / 6) + 120), this.setY(24 * a + 20 - 135 - 145 * Math.floor(b / 6)));
    }
  }
  this.setVisible(this.isVisible());
  this.updateView();
  Entry.stage.loadVariable(this);
};
Entry.Variable.prototype.updateView = function() {
  if (this.view_) {
    if (this.isVisible()) {
      if ("variable" == this.type) {
        this.view_.x = this.getX();
        this.view_.y = this.getY();
        var a = this.textView_.text, b;
        b = this.object_ ? (b = Entry.container.getObject(this.object_)) ? b.name + ":" + this.getName() : this.getName() : this.getName();
        a !== b && (this.textView_.text = b, this._nameWidth = null);
        null === this._nameWidth && (this._nameWidth = this.textView_.getMeasuredWidth());
        this.valueView_.x = this._nameWidth + 14;
        this.valueView_.y = 1;
        this.isNumber() ? this.valueView_.text = this.getValue().toFixed(2).replace(".00", "") : this.valueView_.text = this.getValue();
        null === this._valueWidth && (this._valueWidth = this.valueView_.getMeasuredWidth());
        this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this._nameWidth + this._valueWidth + 26, 20, 4, 4, 4, 4);
        this.wrapper_.graphics.clear().f("#1bafea").ss(1, 2, 0).s("#1bafea").rc(this._nameWidth + 7, -11, this._valueWidth + 15, 14, 7, 7, 7, 7);
      } else {
        if ("slide" == this.type) {
          this.view_.x = this.getX(), this.view_.y = this.getY(), a = this.textView_.text, b = this.object_ ? (b = Entry.container.getObject(this.object_)) ? b.name + ":" + this.getName() : this.getName() : this.getName(), a !== b && (this.textView_.text = b, this._nameWidth = null), null === this._nameWidth && (this._nameWidth = this.textView_.getMeasuredWidth()), this.valueView_.x = this._nameWidth + 14, this.valueView_.y = 1, this.isNumber() ? this.valueView_.text = this.getValue().toFixed(2).replace(".00", 
          "") : this.valueView_.text = this.getValue(), null === this._valueWidth && (this._valueWidth = this.valueView_.getMeasuredWidth()), a = this._nameWidth + this._valueWidth + 26, a = Math.max(a, 90), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, a, 33, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#1bafea").ss(1, 2, 0).s("#1bafea").rc(this._nameWidth + 7, -11, this._valueWidth + 15, 14, 7, 7, 7, 7), a = this._nameWidth + this._valueWidth + 26, a = Math.max(a, 
          90), this.maxWidth = a - 20, this.slideBar_.graphics.clear().beginFill("#A0A1A1").s("#A0A1A1").ss(1).dr(10, 10, this.maxWidth, 1.5), a = this.getSlidePosition(this.maxWidth), this.valueSetter_.graphics.clear().beginFill("#1bafea").s("#A0A1A1").ss(1).dc(a, 10.5, 3);
        } else {
          if ("list" == this.type) {
            this.view_.x = this.getX();
            this.view_.y = this.getY();
            this.resizeHandle_.x = this.width_ - 2;
            this.resizeHandle_.y = this.height_ - 2;
            a = this.getName();
            this.object_ && (b = Entry.container.getObject(this.object_)) && (a = b.name + ":" + a);
            a = 7 < a.length ? a.substr(0, 6) + ".." : a;
            this.titleView_.text = a;
            this.titleView_.x = this.width_ / 2;
            for (this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rect(0, 0, this.width_, this.height_);this.view_.children[4];) {
              this.view_.removeChild(this.view_.children[4]);
            }
            a = Math.floor((this.getHeight() - 20) / 20);
            a < this.array_.length ? (this.scrollButton_.y > this.getHeight() - 40 && (this.scrollButton_.y = this.getHeight() - 40), this.elementView.valueWrapper.graphics.clear().f("#1bafea").rr(20, -2, this.getWidth() - 20 - 10 - 2 * this.BORDER, 17, 2), this.scrollButton_.visible = !0, this.scrollButton_.x = this.getWidth() - 12, this.scrollPosition = Math.floor((this.scrollButton_.y - 23) / (this.getHeight() - 23 - 40) * (this.array_.length - a))) : (this.elementView.valueWrapper.graphics.clear().f("#1bafea").rr(20, 
            -2, this.getWidth() - 20 - 2 * this.BORDER, 17, 2), this.scrollButton_.visible = !1, this.scrollPosition = 0);
            for (b = this.scrollPosition;b < this.scrollPosition + a && b < this.array_.length;b++) {
              this.elementView.indexView.text = b + 1;
              var c = String(this.array_[b].data), d = Math.floor((this.getWidth() - 50) / 7), c = Entry.cutStringByLength(c, d), c = String(this.array_[b].data).length > c.length ? c + ".." : c;
              this.elementView.valueView.text = c;
              c = this.elementView.clone(!0);
              c.y = 20 * (b - this.scrollPosition) + 23;
              this.view_.addChild(c);
            }
          } else {
            "answer" == this.type ? (this.view_.x = this.getX(), this.view_.y = this.getY(), this.textView_.text = this.getName(), this.valueView_.y = 1, this.isNumber() ? parseInt(this.getValue(), 10) == this.getValue() ? this.valueView_.text = this.getValue() : this.valueView_.text = this.getValue().toFixed(1).replace(".00", "") : this.valueView_.text = this.getValue(), null === this._nameWidth && (this._nameWidth = this.textView_.getMeasuredWidth()), null === this._valueWidth && (this._valueWidth = 
            this.valueView_.getMeasuredWidth()), this.valueView_.x = this._nameWidth + 14, this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this._nameWidth + this._valueWidth + 26, 20, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#E457DC").ss(1, 2, 0).s("#E457DC").rc(this._nameWidth + 7, -11, this._valueWidth + 15, 14, 7, 7, 7, 7)) : (this.view_.x = this.getX(), this.view_.y = this.getY(), this.textView_.text = this.getName(), null === this._nameWidth && (this._nameWidth = 
            this.textView_.getMeasuredWidth()), this.valueView_.x = this._nameWidth + 14, this.valueView_.y = 1, this.isNumber() ? this.valueView_.text = this.getValue().toFixed(1).replace(".00", "") : this.valueView_.text = this.getValue(), null === this._valueWidth && (this._valueWidth = this.valueView_.getMeasuredWidth()), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this._nameWidth + this._valueWidth + 26, 20, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#ffbb14").ss(1, 
            2, 0).s("orange").rc(this._nameWidth + 7, -11, this._valueWidth + 15, 14, 7, 7, 7, 7));
          }
        }
      }
    }
    Entry.requestUpdate = !0;
  }
};
Entry.Variable.prototype.getName = function() {
  return this.name_;
};
Entry.Variable.prototype.setName = function(a) {
  Entry.assert("string" == typeof a, "Variable name must be string");
  this.name_ = a;
  this._nameWidth = null;
  this.updateView();
  Entry.requestUpdateTwice = !0;
};
Entry.Variable.prototype.getId = function() {
  return this.id_;
};
Entry.Variable.prototype.getValue = function() {
  return this.isNumber() ? Number(this.value_) : this.value_;
};
Entry.Variable.prototype.isNumber = function() {
  return isNaN(this.value_) ? !1 : !0;
};
Entry.Variable.prototype.setValue = function(a) {
  "slide" != this.type ? this.value_ = a : (a = Number(a), this.value_ = a < this.minValue_ ? this.minValue_ : a > this.maxValue_ ? this.maxValue_ : a);
  this.isCloud_ && Entry.variableContainer.updateCloudVariables();
  this._valueWidth = null;
  this.updateView();
  Entry.requestUpdateTwice = !0;
};
Entry.Variable.prototype.isVisible = function() {
  return this.visible_;
};
Entry.Variable.prototype.setVisible = function(a) {
  Entry.assert("boolean" == typeof a, "Variable visible state must be boolean");
  this.visible !== a && (this.visible_ = this.view_.visible = a, this.updateView());
};
Entry.Variable.prototype.setX = function(a) {
  this.x_ = a;
  this.updateView();
};
Entry.Variable.prototype.getX = function() {
  return this.x_;
};
Entry.Variable.prototype.setY = function(a) {
  this.y_ = a;
  this.updateView();
};
Entry.Variable.prototype.getY = function() {
  return this.y_;
};
Entry.Variable.prototype.setWidth = function(a) {
  this.width_ = 100 > a ? 100 : a;
  this.updateView();
};
Entry.Variable.prototype.getWidth = function() {
  return this.width_;
};
Entry.Variable.prototype.isInList = function(a, b) {
  this.getX();
  this.getY();
};
Entry.Variable.prototype.setHeight = function(a) {
  this.height_ = 100 > a ? 100 : a;
  this.updateView();
};
Entry.Variable.prototype.getHeight = function() {
  return this.height_;
};
Entry.Variable.prototype.takeSnapshot = function() {
  this.snapshot_ = this.toJSON();
};
Entry.Variable.prototype.loadSnapshot = function() {
  this.snapshot_ && this.syncModel_(this.snapshot_);
  delete this.snapshot_;
};
Entry.Variable.prototype.syncModel_ = function(a) {
  this.setX(a.x);
  this.setY(a.y);
  this.setVisible(a.visible);
  this.isCloud_ || this.setValue(a.value);
  this.setName(a.name);
  this.isCloud_ = a.isCloud;
  "list" == this.type && (this.isCloud_ || (this.array_ = a.array), this.setWidth(a.width), this.setHeight(a.height));
};
Entry.Variable.prototype.toJSON = function() {
  var a = {};
  a.name = this.name_;
  a.id = this.id_;
  a.visible = this.visible_;
  a.value = this.value_;
  a.variableType = this.type;
  "list" == this.type ? (a.width = this.getWidth(), a.height = this.getHeight(), a.array = JSON.parse(JSON.stringify(this.array_))) : "slide" == this.type && (a.minValue = this.minValue_, a.maxValue = this.maxValue_);
  a.isCloud = this.isCloud_;
  a.object = this.object_;
  a.x = this.x_;
  a.y = this.y_;
  return a;
};
Entry.Variable.prototype.remove = function() {
  Entry.stage.removeVariable(this);
};
Entry.Variable.prototype.clone = function() {
  var a = this.toJSON();
  a.isClone = !0;
  return a = new Entry.Variable(a);
};
Entry.Variable.prototype.getType = function() {
  return this.type;
};
Entry.Variable.prototype.setType = function(a) {
  this.type = a;
};
Entry.Variable.prototype.getSlidePosition = function(a) {
  var b = this.minValue_;
  return Math.abs(this.value_ - b) / Math.abs(this.maxValue_ - b) * a + 10;
};
Entry.Variable.prototype.setSlideCommandX = function(a) {
  var b = this.valueSetter_.graphics.command;
  a = Math.max("undefined" == typeof a ? 10 : a, 10);
  a = Math.min(this.maxWidth + 10, a);
  b.x = a;
  this.updateSlideValueByView();
};
Entry.Variable.prototype.updateSlideValueByView = function() {
  var a = Math.max(this.valueSetter_.graphics.command.x - 10, 0) / this.maxWidth;
  0 > a && (a = 0);
  1 < a && (a = 1);
  var b = parseFloat(this.minValue_), c = parseFloat(this.maxValue_), a = (b + Number(Math.abs(c - b) * a)).toFixed(2), a = parseFloat(a);
  a < b ? a = this.minValue_ : a > c && (a = this.maxValue_);
  this.isFloatPoint() || (a = Math.round(a));
  this.setValue(a);
};
Entry.Variable.prototype.getMinValue = function() {
  return this.minValue_;
};
Entry.Variable.prototype.setMinValue = function(a) {
  this.minValue_ = a = a || 0;
  this.value_ < a && this.setValue(a);
  this.updateView();
  this.isMinFloat = Entry.isFloat(this.minValue_);
};
Entry.Variable.prototype.getMaxValue = function() {
  return this.maxValue_;
};
Entry.Variable.prototype.setMaxValue = function(a) {
  this.maxValue_ = a = a || 100;
  this.value_ > a && (this.value_ = a);
  this.updateView();
  this.isMaxFloat = Entry.isFloat(this.maxValue_);
};
Entry.Variable.prototype.isFloatPoint = function() {
  return this.isMaxFloat || this.isMinFloat;
};
Entry.VariableContainer = function() {
  this.variables_ = [];
  this.messages_ = [];
  this.lists_ = [];
  this.functions_ = {};
  this.viewMode_ = "all";
  this.selected = null;
  this.variableAddPanel = {isOpen:!1, info:{object:null, isCloud:!1}};
  this.listAddPanel = {isOpen:!1, info:{object:null, isCloud:!1}};
  this.selectedVariable = null;
  this._variableRefs = [];
  this._messageRefs = [];
  this._functionRefs = [];
};
Entry.VariableContainer.prototype.createDom = function(a) {
  var b = this;
  this.view_ = a;
  var c = Entry.createElement("table");
  c.addClass("entryVariableSelectorWorkspace");
  this.view_.appendChild(c);
  var d = Entry.createElement("tr");
  c.appendChild(d);
  var e = this.createSelectButton("all");
  e.setAttribute("rowspan", "2");
  e.addClass("selected", "allButton");
  d.appendChild(e);
  d.appendChild(this.createSelectButton("variable", Entry.variableEnable));
  d.appendChild(this.createSelectButton("message", Entry.messageEnable));
  d = Entry.createElement("tr");
  d.appendChild(this.createSelectButton("list", Entry.listEnable));
  d.appendChild(this.createSelectButton("func", Entry.functionEnable));
  c.appendChild(d);
  c = Entry.createElement("ul");
  c.addClass("entryVariableListWorkspace");
  this.view_.appendChild(c);
  this.listView_ = c;
  c = Entry.createElement("li");
  c.addClass("entryVariableAddWorkspace");
  c.addClass("entryVariableListElementWorkspace");
  c.innerHTML = "+ " + Lang.Workspace.variable_add;
  var f = this;
  this.variableAddButton_ = c;
  c.bindOnClick(function(a) {
    a = f.variableAddPanel;
    var c = a.view.name.value.trim();
    a.isOpen ? c && 0 !== c.length ? b.addVariable() : (a.view.addClass("entryRemove"), a.isOpen = !1) : (a.view.removeClass("entryRemove"), a.view.name.focus(), a.isOpen = !0);
  });
  this.generateVariableAddView();
  this.generateListAddView();
  this.generateVariableSplitterView();
  this.generateVariableSettingView();
  this.generateListSettingView();
  c = Entry.createElement("li");
  c.addClass("entryVariableAddWorkspace");
  c.addClass("entryVariableListElementWorkspace");
  c.innerHTML = "+ " + Lang.Workspace.message_create;
  this.messageAddButton_ = c;
  c.bindOnClick(function(a) {
    b.addMessage({name:Lang.Workspace.message + " " + (b.messages_.length + 1)});
  });
  c = Entry.createElement("li");
  c.addClass("entryVariableAddWorkspace");
  c.addClass("entryVariableListElementWorkspace");
  c.innerHTML = "+ " + Lang.Workspace.list_create;
  this.listAddButton_ = c;
  c.bindOnClick(function(a) {
    a = f.listAddPanel;
    var c = a.view.name.value.trim();
    a.isOpen ? c && 0 !== c.length ? b.addList() : (a.view.addClass("entryRemove"), a.isOpen = !1) : (a.view.removeClass("entryRemove"), a.view.name.focus(), a.isOpen = !0);
  });
  c = Entry.createElement("li");
  c.addClass("entryVariableAddWorkspace");
  c.addClass("entryVariableListElementWorkspace");
  c.innerHTML = "+ " + Lang.Workspace.function_add;
  this.functionAddButton_ = c;
  c.bindOnClick(function(a) {
    a = Entry.playground;
    var c = b._getBlockMenu();
    a.changeViewMode("code");
    "func" != c.lastSelector && c.selectMenu("func");
    b.createFunction();
  });
  return a;
};
Entry.VariableContainer.prototype.createSelectButton = function(a, b) {
  var c = this;
  void 0 === b && (b = !0);
  var d = Entry.createElement("td");
  d.addClass("entryVariableSelectButtonWorkspace", a);
  d.innerHTML = Lang.Workspace[a];
  b ? d.bindOnClick(function(b) {
    c.selectFilter(a);
    this.addClass("selected");
  }) : d.addClass("disable");
  return d;
};
Entry.VariableContainer.prototype.selectFilter = function(a) {
  for (var b = this.view_.getElementsByTagName("td"), c = 0;c < b.length;c++) {
    b[c].removeClass("selected"), b[c].hasClass(a) && b[c].addClass("selected");
  }
  this.viewMode_ = a;
  this.select();
  this.updateList();
};
Entry.VariableContainer.prototype.updateVariableAddView = function(a) {
  a = "variable" == (a ? a : "variable") ? this.variableAddPanel : this.listAddPanel;
  var b = a.info, c = a.view;
  a.view.addClass("entryRemove");
  c.cloudCheck.removeClass("entryVariableAddChecked");
  c.localCheck.removeClass("entryVariableAddChecked");
  c.globalCheck.removeClass("entryVariableAddChecked");
  c.cloudWrapper.removeClass("entryVariableAddSpaceUnCheckedWorkspace");
  b.isCloud && c.cloudCheck.addClass("entryVariableAddChecked");
  a.isOpen && (c.removeClass("entryRemove"), c.name.focus());
  b.object ? (c.localCheck.addClass("entryVariableAddChecked"), c.cloudWrapper.addClass("entryVariableAddSpaceUnCheckedWorkspace")) : c.globalCheck.addClass("entryVariableAddChecked");
};
Entry.VariableContainer.prototype.select = function(a) {
  a = this.selected == a ? null : a;
  this.selected && (this.selected.listElement.removeClass("selected"), this.selected.callerListElement && (this.listView_.removeChild(this.selected.callerListElement), delete this.selected.callerListElement), this.selected = null);
  a && (a.listElement.addClass("selected"), this.selected = a, a instanceof Entry.Variable ? (this.renderVariableReference(a), a.object_ && Entry.container.selectObject(a.object_, !0)) : a instanceof Entry.Func ? this.renderFunctionReference(a) : this.renderMessageReference(a));
};
Entry.VariableContainer.prototype.getMessage = function(a) {
  return this.messages_.filter(function(b) {
    return b.id === a;
  })[0];
};
Entry.VariableContainer.prototype.renderMessageReference = function(a) {
  for (var b = this, c = this._messageRefs, d = a.id, e = [], f = 0;f < c.length;f++) {
    -1 < c[f].block.params.indexOf(d) && e.push(c[f]);
  }
  c = Entry.createElement("ul");
  c.addClass("entryVariableListCallerListWorkspace");
  for (f in e) {
    var d = e[f], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(d.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = d.object.name + " : " + Lang.Blocks["START_" + d.block.type];
    g.appendChild(h);
    g.caller = d;
    g.message = a;
    g.bindOnClick(function(a) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), b.select(null), b.select(this.message));
      Entry.playground.toggleOnVariableView();
      Entry.playground.changeViewMode("variable");
    });
    c.appendChild(g);
  }
  0 === e.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, c.appendChild(g));
  a.callerListElement = c;
  this.listView_.insertBefore(c, a.listElement);
  this.listView_.insertBefore(a.listElement, c);
};
Entry.VariableContainer.prototype.renderVariableReference = function(a) {
  for (var b = this, c = this._variableRefs, d = a.id_, e = [], f = 0;f < c.length;f++) {
    -1 < c[f].block.params.indexOf(d) && e.push(c[f]);
  }
  c = Entry.createElement("ul");
  c.addClass("entryVariableListCallerListWorkspace");
  for (f in e) {
    var d = e[f], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(d.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = d.object.name + " : " + Lang.Blocks["VARIABLE_" + d.block.type];
    g.appendChild(h);
    g.caller = d;
    g.variable = a;
    g.bindOnClick(function(a) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), b.select(null));
      a = this.caller;
      a = a.funcBlock || a.block;
      a.view.getBoard().activateBlock(a);
      Entry.playground.toggleOnVariableView();
      Entry.playground.changeViewMode("variable");
    });
    c.appendChild(g);
  }
  0 === e.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, c.appendChild(g));
  a.callerListElement = c;
  this.listView_.insertBefore(c, a.listElement);
  this.listView_.insertBefore(a.listElement, c);
};
Entry.VariableContainer.prototype.renderFunctionReference = function(a) {
  for (var b = this, c = this._functionRefs, d = [], e = 0;e < c.length;e++) {
    d.push(c[e]);
  }
  c = Entry.createElement("ul");
  c.addClass("entryVariableListCallerListWorkspace");
  for (e in d) {
    var f = d[e], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(f.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = f.object.name;
    g.appendChild(h);
    g.caller = f;
    g.bindOnClick(function(c) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), b.select(null), b.select(a));
      c = this.caller.block;
      Entry.playground.toggleOnVariableView();
      c.view.getBoard().activateBlock(c);
      Entry.playground.changeViewMode("variable");
    });
    c.appendChild(g);
  }
  0 === d.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, c.appendChild(g));
  a.callerListElement = c;
  this.listView_.insertBefore(c, a.listElement);
  this.listView_.insertBefore(a.listElement, c);
};
Entry.VariableContainer.prototype.updateList = function() {
  if (this.listView_) {
    this.variableSettingView.addClass("entryRemove");
    for (this.listSettingView.addClass("entryRemove");this.listView_.firstChild;) {
      this.listView_.removeChild(this.listView_.firstChild);
    }
    var a = this.viewMode_, b = [];
    if ("all" == a || "message" == a) {
      "message" == a && this.listView_.appendChild(this.messageAddButton_);
      for (var c in this.messages_) {
        var d = this.messages_[c];
        b.push(d);
        var e = d.listElement;
        this.listView_.appendChild(e);
        d.callerListElement && this.listView_.appendChild(d.callerListElement);
      }
    }
    if ("all" == a || "variable" == a) {
      if ("variable" == a) {
        e = this.variableAddPanel.info;
        e.object && !Entry.playground.object && (e.object = null);
        this.listView_.appendChild(this.variableAddButton_);
        this.listView_.appendChild(this.variableAddPanel.view);
        this.variableSplitters.top.innerHTML = Lang.Workspace.Variable_used_at_all_objects;
        this.listView_.appendChild(this.variableSplitters.top);
        for (c in this.variables_) {
          d = this.variables_[c], d.object_ || (b.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement));
        }
        this.variableSplitters.bottom.innerHTML = Lang.Workspace.Variable_used_at_special_object;
        this.listView_.appendChild(this.variableSplitters.bottom);
        for (c in this.variables_) {
          d = this.variables_[c], d.object_ && (b.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement));
        }
        this.updateVariableAddView("variable");
      } else {
        for (c in this.variables_) {
          d = this.variables_[c], b.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement);
        }
      }
    }
    if ("all" == a || "list" == a) {
      if ("list" == a) {
        e = this.listAddPanel.info;
        e.object && !Entry.playground.object && (e.object = null);
        this.listView_.appendChild(this.listAddButton_);
        this.listView_.appendChild(this.listAddPanel.view);
        this.variableSplitters.top.innerHTML = Lang.Workspace.List_used_all_objects;
        this.listView_.appendChild(this.variableSplitters.top);
        this.updateVariableAddView("list");
        for (c in this.lists_) {
          d = this.lists_[c], d.object_ || (b.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement));
        }
        this.variableSplitters.bottom.innerHTML = Lang.Workspace.list_used_specific_objects;
        this.listView_.appendChild(this.variableSplitters.bottom);
        for (c in this.lists_) {
          d = this.lists_[c], d.object_ && (b.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement));
        }
        this.updateVariableAddView("variable");
      } else {
        for (c in this.lists_) {
          d = this.lists_[c], b.push(d), e = d.listElement, this.listView_.appendChild(e), d.callerListElement && this.listView_.appendChild(d.callerListElement);
        }
      }
    }
    if ("all" == a || "func" == a) {
      for (c in "func" == a && (a = Entry.Workspace.MODE_BOARD, Entry.playground && Entry.playground.mainWorkspace && (a = Entry.playground.mainWorkspace.getMode()), a === Entry.Workspace.MODE_OVERLAYBOARD ? this.functionAddButton_.addClass("disable") : this.functionAddButton_.removeClass("disable"), this.listView_.appendChild(this.functionAddButton_)), this.functions_) {
        a = this.functions_[c], b.push(a), e = a.listElement, this.listView_.appendChild(e), a.callerListElement && this.listView_.appendChild(a.callerListElement);
      }
    }
    this.listView_.appendChild(this.variableSettingView);
    this.listView_.appendChild(this.listSettingView);
  }
};
Entry.VariableContainer.prototype.setMessages = function(a) {
  for (var b in a) {
    var c = a[b];
    c.id || (c.id = Entry.generateHash());
    this.createMessageView(c);
    this.messages_.push(c);
  }
  Entry.playground.reloadPlayground();
  this.updateList();
};
Entry.VariableContainer.prototype.setVariables = function(a) {
  for (var b in a) {
    var c = new Entry.Variable(a[b]), d = c.getType();
    "variable" == d || "slide" == d ? (c.generateView(this.variables_.length), this.createVariableView(c), this.variables_.push(c)) : "list" == d ? (c.generateView(this.lists_.length), this.createListView(c), this.lists_.push(c)) : "timer" == d ? this.generateTimer(c) : "answer" == d && this.generateAnswer(c);
  }
  Entry.isEmpty(Entry.engine.projectTimer) && Entry.variableContainer.generateTimer();
  Entry.isEmpty(Entry.container.inputValue) && Entry.variableContainer.generateAnswer();
  Entry.playground.reloadPlayground();
  this.updateList();
};
Entry.VariableContainer.prototype.setFunctions = function(a) {
  for (var b in a) {
    var c = new Entry.Func(a[b]);
    c.generateBlock();
    this.createFunctionView(c);
    this.functions_[c.id] = c;
  }
  this.updateList();
};
Entry.VariableContainer.prototype.getFunction = function(a) {
  return this.functions_[a];
};
Entry.VariableContainer.prototype.getVariable = function(a, b) {
  var c = Entry.findObjsByKey(this.variables_, "id_", a)[0];
  b && b.isClone && c.object_ && (c = Entry.findObjsByKey(b.variables, "id_", a)[0]);
  return c;
};
Entry.VariableContainer.prototype.getList = function(a, b) {
  var c = Entry.findObjsByKey(this.lists_, "id_", a)[0];
  b && b.isClone && c.object_ && (c = Entry.findObjsByKey(b.lists, "id_", a)[0]);
  return c;
};
Entry.VariableContainer.prototype.createFunction = function() {
  if (!Entry.Func.isEdit) {
    var a = new Entry.Func;
    Entry.Func.edit(a);
  }
};
Entry.VariableContainer.prototype.addFunction = function(a) {
};
Entry.VariableContainer.prototype.removeFunction = function(a) {
  var b = a.id;
  a = this.functions_;
  a[b].destroy();
  delete a[b];
  b = "func_" + b;
  Entry.container.removeFuncBlocks(b);
  for (var c in a) {
    a[c].content.removeBlocksByType(b);
  }
  this.updateList();
};
Entry.VariableContainer.prototype.checkListPosition = function(a, b) {
  var c = a.x_ + a.width_, d = -a.y_, e = -a.y_ + -a.height_;
  return b.x > a.x_ && b.x < c && b.y < d && b.y > e ? !0 : !1;
};
Entry.VariableContainer.prototype.getListById = function(a) {
  var b = this.lists_, c = [];
  if (0 < b.length) {
    for (var d = 0;d < b.length;d++) {
      this.checkListPosition(b[d], a) && c.push(b[d]);
    }
    return c;
  }
  return !1;
};
Entry.VariableContainer.prototype.editFunction = function(a, b) {
};
Entry.VariableContainer.prototype.saveFunction = function(a) {
  this.functions_[a.id] || (this.functions_[a.id] = a, this.createFunctionView(a));
  a.listElement.nameField.innerHTML = a.description;
  this.updateList();
};
Entry.VariableContainer.prototype.createFunctionView = function(a) {
  var b = this;
  if (this.view_) {
    var c = Entry.createElement("li");
    c.addClass("entryVariableListElementWorkspace");
    c.addClass("entryFunctionElementWorkspace");
    c.bindOnClick(function(c) {
      c.stopPropagation();
      b.select(a);
    });
    var d = Entry.createElement("button");
    d.addClass("entryVariableListElementDeleteWorkspace");
    d.bindOnClick(function(c) {
      c.stopPropagation();
      confirm(Lang.Workspace.will_you_delete_function) && (b.removeFunction(a), b.selected = null);
    });
    var e = Entry.createElement("button");
    e.addClass("entryVariableListElementEditWorkspace");
    var f = this._getBlockMenu();
    e.bindOnClick(function(b) {
      b.stopPropagation();
      if (b = Entry.playground) {
        b.changeViewMode("code"), "func" != f.lastSelector && f.selectMenu("func");
      }
      Entry.Func.edit(a);
    });
    var g = Entry.createElement("div");
    g.addClass("entryVariableFunctionElementNameWorkspace");
    g.innerHTML = a.description;
    c.nameField = g;
    c.appendChild(g);
    c.appendChild(e);
    c.appendChild(d);
    a.listElement = c;
  }
};
Entry.VariableContainer.prototype.checkAllVariableName = function(a, b) {
  b = this[b];
  for (var c = 0;c < b.length;c++) {
    if (b[c].name_ == a) {
      return !0;
    }
  }
  return !1;
};
Entry.VariableContainer.prototype.addVariable = function(a) {
  if (!a) {
    var b = this.variableAddPanel;
    a = b.view.name.value.trim();
    a && 0 !== a.length || (a = Lang.Workspace.variable);
    a.length > this._maxNameLength && (a = this._truncName(a, "variable"));
    a = this.checkAllVariableName(a, "variables_") ? Entry.getOrderedName(a, this.variables_, "name_") : a;
    var c = b.info;
    a = {name:a, isCloud:c.isCloud, object:c.object, variableType:"variable"};
    b.view.addClass("entryRemove");
    this.resetVariableAddPanel("variable");
  }
  a = new Entry.Variable(a);
  Entry.stateManager && Entry.stateManager.addCommand("add variable", this, this.removeVariable, a);
  a.generateView(this.variables_.length);
  this.createVariableView(a);
  this.variables_.unshift(a);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.removeVariable, a);
};
Entry.VariableContainer.prototype.removeVariable = function(a) {
  var b = this.variables_.indexOf(a), c = a.toJSON();
  this.selected == a && this.select(null);
  a.remove();
  this.variables_.splice(b, 1);
  Entry.stateManager && Entry.stateManager.addCommand("remove variable", this, this.addVariable, c);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.addVariable, c);
};
Entry.VariableContainer.prototype.changeVariableName = function(a, b) {
  a.name_ != b && (Entry.isExist(b, "name_", this.variables_) ? (a.listElement.nameField.value = a.name_, Entry.toast.alert(Lang.Workspace.variable_rename_failed, Lang.Workspace.variable_dup)) : 10 < b.length ? (a.listElement.nameField.value = a.name_, Entry.toast.alert(Lang.Workspace.variable_rename_failed, Lang.Workspace.variable_too_long)) : (a.setName(b), Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.variable_rename, Lang.Workspace.variable_rename_ok)));
};
Entry.VariableContainer.prototype.changeListName = function(a, b) {
  a.name_ != b && (Entry.isExist(b, "name_", this.lists_) ? (a.listElement.nameField.value = a.name_, Entry.toast.alert(Lang.Workspace.list_rename_failed, Lang.Workspace.list_dup)) : 10 < b.length ? (a.listElement.nameField.value = a.name_, Entry.toast.alert(Lang.Workspace.list_rename_failed, Lang.Workspace.list_too_long)) : (a.name_ = b, a.updateView(), Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.list_rename, Lang.Workspace.list_rename_ok)));
};
Entry.VariableContainer.prototype.removeList = function(a) {
  var b = this.lists_.indexOf(a), c = a.toJSON();
  Entry.stateManager && Entry.stateManager.addCommand("remove list", this, this.addList, c);
  this.selected == a && this.select(null);
  a.remove();
  this.lists_.splice(b, 1);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.addList, c);
};
Entry.VariableContainer.prototype.createVariableView = function(a) {
  var b = this, c = Entry.createElement("li"), d = Entry.createElement("div");
  d.addClass("entryVariableListElementWrapperWorkspace");
  c.appendChild(d);
  c.addClass("entryVariableListElementWorkspace");
  a.object_ ? c.addClass("entryVariableLocalElementWorkspace") : a.isCloud_ ? c.addClass("entryVariableCloudElementWorkspace") : c.addClass("entryVariableGlobalElementWorkspace");
  c.bindOnClick(function(c) {
    b.select(a);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementDeleteWorkspace");
  e.bindOnClick(function(c) {
    c.stopPropagation();
    b.removeVariable(a);
    b.selectedVariable = null;
    b.variableSettingView.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.bindOnClick(function(c) {
    c.stopPropagation();
    h.removeAttribute("disabled");
    g.removeClass("entryRemove");
    this.addClass("entryRemove");
    b.updateSelectedVariable(a);
    h.focus();
  });
  c.editButton = f;
  var g = Entry.createElement("button");
  g.addClass("entryVariableListElementEditWorkspace");
  g.addClass("entryRemove");
  g.bindOnClick(function(a) {
    a.stopPropagation();
    h.blur();
    h.setAttribute("disabled", "disabled");
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
    b.updateSelectedVariable(null, "variable");
  });
  c.editSaveButton = g;
  var h = Entry.createElement("input");
  h.addClass("entryVariableListElementNameWorkspace");
  h.setAttribute("disabled", "disabled");
  h.value = a.name_;
  h.bindOnClick(function(b) {
    b.stopPropagation();
  });
  h.onblur = function(c) {
    (c = this.value.trim()) && 0 !== c.length ? b.changeVariableName(a, this.value) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Workspace.variable_can_not_space), this.value = a.getName());
  };
  h.onkeydown = function(b) {
    13 == b.keyCode && this.blur();
  };
  c.nameField = h;
  d.appendChild(h);
  d.appendChild(f);
  d.appendChild(g);
  d.appendChild(e);
  a.listElement = c;
};
Entry.VariableContainer.prototype.addMessage = function(a) {
  a.id || (a.id = Entry.generateHash());
  Entry.stateManager && Entry.stateManager.addCommand("add message", this, this.removeMessage, a);
  this.createMessageView(a);
  this.messages_.unshift(a);
  Entry.playground.reloadPlayground();
  this.updateList();
  a.listElement.nameField.focus();
  return new Entry.State(this, this.removeMessage, a);
};
Entry.VariableContainer.prototype.removeMessage = function(a) {
  this.selected == a && this.select(null);
  Entry.stateManager && Entry.stateManager.addCommand("remove message", this, this.addMessage, a);
  var b = this.messages_.indexOf(a);
  this.messages_.splice(b, 1);
  this.updateList();
  Entry.playground.reloadPlayground();
  return new Entry.State(this, this.addMessage, a);
};
Entry.VariableContainer.prototype.changeMessageName = function(a, b) {
  a.name != b && (Entry.isExist(b, "name", this.messages_) ? (a.listElement.nameField.value = a.name, Entry.toast.alert(Lang.Workspace.message_rename_failed, Lang.Workspace.message_dup)) : 10 < b.length ? (a.listElement.nameField.value = a.name, Entry.toast.alert(Lang.Workspace.message_rename_failed, Lang.Workspace.message_too_long)) : (a.name = b, Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.message_rename, Lang.Workspace.message_rename_ok)));
};
Entry.VariableContainer.prototype.createMessageView = function(a) {
  var b = this, c = Entry.createElement("li");
  c.addClass("entryVariableListElementWorkspace");
  c.addClass("entryMessageElementWorkspace");
  c.bindOnClick(function(c) {
    b.select(a);
  });
  var d = Entry.createElement("button");
  d.addClass("entryVariableListElementDeleteWorkspace");
  d.bindOnClick(function(c) {
    c.stopPropagation();
    b.removeMessage(a);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementEditWorkspace");
  e.bindOnClick(function(b) {
    b.stopPropagation();
    g.removeAttribute("disabled");
    g.focus();
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.addClass("entryRemove");
  f.bindOnClick(function(b) {
    b.stopPropagation();
    g.blur();
    e.removeClass("entryRemove");
    this.addClass("entryRemove");
  });
  var g = Entry.createElement("input");
  g.addClass("entryVariableListElementNameWorkspace");
  g.value = a.name;
  g.bindOnClick(function(b) {
    b.stopPropagation();
  });
  g.onblur = function(c) {
    (c = this.value.trim()) && 0 !== c.length ? (b.changeMessageName(a, this.value), e.removeClass("entryRemove"), f.addClass("entryRemove"), g.setAttribute("disabled", "disabled")) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Msgs.sign_can_not_space), this.value = a.name);
  };
  g.onkeydown = function(b) {
    13 == b.keyCode && this.blur();
  };
  c.nameField = g;
  c.appendChild(g);
  c.appendChild(e);
  c.appendChild(f);
  c.appendChild(d);
  a.listElement = c;
};
Entry.VariableContainer.prototype.addList = function(a) {
  if (!a) {
    var b = this.listAddPanel;
    a = b.view.name.value.trim();
    a && 0 !== a.length || (a = Lang.Workspace.list);
    var c = b.info;
    a.length > this._maxNameLength && (a = this._truncName(a, "list"));
    a = this.checkAllVariableName(a, "lists_") ? Entry.getOrderedName(a, this.lists_, "name_") : a;
    a = {name:a, isCloud:c.isCloud, object:c.object, variableType:"list"};
    b.view.addClass("entryRemove");
    this.resetVariableAddPanel("list");
  }
  a = new Entry.Variable(a);
  Entry.stateManager && Entry.stateManager.addCommand("add list", this, this.removeList, a);
  a.generateView(this.lists_.length);
  this.createListView(a);
  this.lists_.unshift(a);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.removelist, a);
};
Entry.VariableContainer.prototype.createListView = function(a) {
  var b = this, c = Entry.createElement("li"), d = Entry.createElement("div");
  d.addClass("entryVariableListElementWrapperWorkspace");
  c.appendChild(d);
  c.addClass("entryVariableListElementWorkspace");
  a.object_ ? c.addClass("entryListLocalElementWorkspace") : a.isCloud_ ? c.addClass("entryListCloudElementWorkspace") : c.addClass("entryListGlobalElementWorkspace");
  c.bindOnClick(function(c) {
    b.select(a);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementDeleteWorkspace");
  e.bindOnClick(function(c) {
    c.stopPropagation();
    b.removeList(a);
    b.selectedList = null;
    b.listSettingView.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.bindOnClick(function(c) {
    c.stopPropagation();
    h.removeAttribute("disabled");
    g.removeClass("entryRemove");
    this.addClass("entryRemove");
    b.updateSelectedVariable(a);
    h.focus();
  });
  c.editButton = f;
  var g = Entry.createElement("button");
  g.addClass("entryVariableListElementEditWorkspace");
  g.addClass("entryRemove");
  g.bindOnClick(function(c) {
    c.stopPropagation();
    h.blur();
    h.setAttribute("disabled", "disabled");
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
    b.select(a);
    b.updateSelectedVariable(null, "list");
  });
  c.editSaveButton = g;
  var h = Entry.createElement("input");
  h.setAttribute("disabled", "disabled");
  h.addClass("entryVariableListElementNameWorkspace");
  h.value = a.name_;
  h.bindOnClick(function(b) {
    b.stopPropagation();
  });
  h.onblur = function(c) {
    (c = this.value.trim()) && 0 !== c.length ? b.changeListName(a, this.value) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Msgs.list_can_not_space), this.value = a.getName());
  };
  h.onkeydown = function(b) {
    13 == b.keyCode && this.blur();
  };
  c.nameField = h;
  d.appendChild(h);
  d.appendChild(f);
  d.appendChild(g);
  d.appendChild(e);
  a.listElement = c;
};
Entry.VariableContainer.prototype.mapVariable = function(a, b) {
  for (var c = this.variables_.length, d = 0;d < c;d++) {
    a(this.variables_[d], b);
  }
};
Entry.VariableContainer.prototype.mapList = function(a, b) {
  for (var c = this.lists_.length, d = 0;d < c;d++) {
    a(this.lists_[d], b);
  }
};
Entry.VariableContainer.prototype.getVariableJSON = function() {
  for (var a = [], b = 0;b < this.variables_.length;b++) {
    a.push(this.variables_[b].toJSON());
  }
  for (b = 0;b < this.lists_.length;b++) {
    a.push(this.lists_[b].toJSON());
  }
  Entry.engine.projectTimer && a.push(Entry.engine.projectTimer.toJSON());
  b = Entry.container.inputValue;
  Entry.isEmpty(b) || a.push(b.toJSON());
  return a;
};
Entry.VariableContainer.prototype.getMessageJSON = function() {
  for (var a = [], b = 0;b < this.messages_.length;b++) {
    a.push({id:this.messages_[b].id, name:this.messages_[b].name});
  }
  return a;
};
Entry.VariableContainer.prototype.getFunctionJSON = function() {
  var a = [], b;
  for (b in this.functions_) {
    var c = this.functions_[b], c = {id:c.id, content:JSON.stringify(c.content.toJSON())};
    a.push(c);
  }
  return a;
};
Entry.VariableContainer.prototype.resetVariableAddPanel = function(a) {
  a = a || "variable";
  var b = "variable" == a ? this.variableAddPanel : this.listAddPanel, c = b.info;
  c.isCloud = !1;
  c.object = null;
  b.view.name.value = "";
  b.isOpen = !1;
  this.updateVariableAddView(a);
};
Entry.VariableContainer.prototype.generateVariableAddView = function() {
  var a = this, b = Entry.createElement("li");
  this.variableAddPanel.view = b;
  this.variableAddPanel.isOpen = !1;
  b.addClass("entryVariableAddSpaceWorkspace");
  b.addClass("entryRemove");
  var c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceNameWrapperWorkspace");
  b.appendChild(c);
  var d = Entry.createElement("input");
  d.addClass("entryVariableAddSpaceInputWorkspace");
  d.setAttribute("placeholder", Lang.Workspace.Variable_placeholder_name);
  d.variableContainer = this;
  d.onkeypress = function(b) {
    13 == b.keyCode && (Entry.variableContainer.addVariable(), a.updateSelectedVariable(a.variables_[0]), b = a.variables_[0].listElement, b.editButton.addClass("entryRemove"), b.editSaveButton.removeClass("entryRemove"), b.nameField.removeAttribute("disabled"));
  };
  this.variableAddPanel.view.name = d;
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceGlobalWrapperWorkspace");
  c.bindOnClick(function(b) {
    a.variableAddPanel.info.object = null;
    a.updateVariableAddView("variable");
  });
  b.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.Variable_use_all_objects;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  this.variableAddPanel.view.globalCheck = d;
  this.variableAddPanel.info.object || d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceLocalWrapperWorkspace");
  c.bindOnClick(function(b) {
    Entry.playground.object && (b = a.variableAddPanel.info, b.object = Entry.playground.object.id, b.isCloud = !1, a.updateVariableAddView("variable"));
  });
  b.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.Variable_use_this_object;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  this.variableAddPanel.view.localCheck = d;
  this.variableAddPanel.info.object && d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  b.cloudWrapper = c;
  c.addClass("entryVariableAddSpaceCloudWrapperWorkspace");
  c.bindOnClick(function(b) {
    b = a.variableAddPanel.info;
    b.object || (b.isCloud = !b.isCloud, a.updateVariableAddView("variable"));
  });
  b.appendChild(c);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCloudSpanWorkspace");
  d.innerHTML = Lang.Workspace.Variable_create_cloud;
  c.appendChild(d);
  d = Entry.createElement("span");
  this.variableAddPanel.view.cloudCheck = d;
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  d.addClass("entryVariableAddSpaceCloudCheckWorkspace");
  this.variableAddPanel.info.isCloud && d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceButtonWrapperWorkspace");
  b.appendChild(c);
  b = Entry.createElement("span");
  b.addClass("entryVariableAddSpaceCancelWorkspace");
  b.addClass("entryVariableAddSpaceButtonWorkspace");
  b.innerHTML = Lang.Buttons.cancel;
  b.bindOnClick(function(b) {
    a.variableAddPanel.view.addClass("entryRemove");
    a.resetVariableAddPanel("variable");
  });
  c.appendChild(b);
  b = Entry.createElement("span");
  b.addClass("entryVariableAddSpaceConfirmWorkspace");
  b.addClass("entryVariableAddSpaceButtonWorkspace");
  b.innerHTML = Lang.Buttons.save;
  b.variableContainer = this;
  b.bindOnClick(function(b) {
    Entry.variableContainer.addVariable();
    a.updateSelectedVariable(a.variables_[0]);
    b = a.variables_[0].listElement;
    b.editButton.addClass("entryRemove");
    b.editSaveButton.removeClass("entryRemove");
    b.nameField.removeAttribute("disabled");
  });
  c.appendChild(b);
};
Entry.VariableContainer.prototype.generateListAddView = function() {
  var a = this, b = Entry.createElement("li");
  this.listAddPanel.view = b;
  this.listAddPanel.isOpen = !1;
  b.addClass("entryVariableAddSpaceWorkspace");
  b.addClass("entryRemove");
  var c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceNameWrapperWorkspace");
  c.addClass("entryListAddSpaceNameWrapperWorkspace");
  b.appendChild(c);
  var d = Entry.createElement("input");
  d.addClass("entryVariableAddSpaceInputWorkspace");
  d.setAttribute("placeholder", Lang.Workspace.list_name);
  this.listAddPanel.view.name = d;
  d.variableContainer = this;
  d.onkeypress = function(b) {
    13 == b.keyCode && (a.addList(), b = a.lists_[0], a.updateSelectedVariable(b), b = b.listElement, b.editButton.addClass("entryRemove"), b.editSaveButton.removeClass("entryRemove"), b.nameField.removeAttribute("disabled"));
  };
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceGlobalWrapperWorkspace");
  c.bindOnClick(function(b) {
    a.listAddPanel.info.object = null;
    a.updateVariableAddView("list");
  });
  b.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.use_all_objects;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  this.listAddPanel.view.globalCheck = d;
  this.listAddPanel.info.object || d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceLocalWrapperWorkspace");
  c.bindOnClick(function(b) {
    Entry.playground.object && (b = a.listAddPanel.info, b.object = Entry.playground.object.id, b.isCloud = !1, a.updateVariableAddView("list"));
  });
  b.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.Variable_use_this_object;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  this.listAddPanel.view.localCheck = d;
  this.variableAddPanel.info.object && addVariableLocalCheck.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  b.cloudWrapper = c;
  c.addClass("entryVariableAddSpaceCloudWrapperWorkspace");
  c.bindOnClick(function(b) {
    b = a.listAddPanel.info;
    b.object || (b.isCloud = !b.isCloud, a.updateVariableAddView("list"));
  });
  b.appendChild(c);
  d = Entry.createElement("span");
  d.addClass("entryVariableAddSpaceCloudSpanWorkspace");
  d.innerHTML = Lang.Workspace.List_create_cloud;
  c.appendChild(d);
  d = Entry.createElement("span");
  this.listAddPanel.view.cloudCheck = d;
  d.addClass("entryVariableAddSpaceCheckWorkspace");
  d.addClass("entryVariableAddSpaceCloudCheckWorkspace");
  this.listAddPanel.info.isCloud && d.addClass("entryVariableAddChecked");
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableAddSpaceButtonWrapperWorkspace");
  b.appendChild(c);
  b = Entry.createElement("span");
  b.addClass("entryVariableAddSpaceCancelWorkspace");
  b.addClass("entryVariableAddSpaceButtonWorkspace");
  b.innerHTML = Lang.Buttons.cancel;
  b.bindOnClick(function(b) {
    a.listAddPanel.view.addClass("entryRemove");
    a.resetVariableAddPanel("list");
  });
  c.appendChild(b);
  b = Entry.createElement("span");
  b.addClass("entryVariableAddSpaceConfirmWorkspace");
  b.addClass("entryVariableAddSpaceButtonWorkspace");
  b.innerHTML = Lang.Buttons.save;
  b.variableContainer = this;
  b.bindOnClick(function(b) {
    a.addList();
    b = a.lists_[0];
    a.updateSelectedVariable(b);
    b = b.listElement;
    b.editButton.addClass("entryRemove");
    b.editSaveButton.removeClass("entryRemove");
    b.nameField.removeAttribute("disabled");
  });
  c.appendChild(b);
};
Entry.VariableContainer.prototype.generateVariableSplitterView = function() {
  var a = Entry.createElement("li");
  a.addClass("entryVariableSplitterWorkspace");
  var b = Entry.createElement("li");
  b.addClass("entryVariableSplitterWorkspace");
  this.variableSplitters = {top:a, bottom:b};
};
Entry.VariableContainer.prototype.openVariableAddPanel = function(a) {
  a = a ? a : "variable";
  Entry.playground.toggleOnVariableView();
  Entry.playground.changeViewMode("variable");
  "variable" == a ? this.variableAddPanel.isOpen = !0 : this.listAddPanel.isOpen = !0;
  this.selectFilter(a);
  this.updateVariableAddView(a);
};
Entry.VariableContainer.prototype.getMenuXml = function(a) {
  for (var b = [], c = 0 !== this.variables_.length, d = 0 !== this.lists_.length, e, f = 0, g;g = a[f];f++) {
    var h = g.tagName;
    h && "BLOCK" == h.toUpperCase() ? (e = g.getAttribute("bCategory"), !c && "variable" == e || !d && "list" == e || b.push(g)) : !h || "SPLITTER" != h.toUpperCase() && "BTN" != h.toUpperCase() || !c && "variable" == e || (d || "list" != e) && b.push(g);
  }
  return b;
};
Entry.VariableContainer.prototype.addCloneLocalVariables = function(a) {
  var b = [], c = this;
  this.mapVariable(function(a, c) {
    a.object_ && a.object_ == c.objectId && (a = a.toJSON(), a.originId = a.id, a.id = Entry.generateHash(), a.object = c.newObjectId, delete a.x, delete a.y, b.push(a), c.json.script = c.json.script.replace(new RegExp(a.originId, "g"), a.id));
  }, a);
  b.map(function(b) {
    c.addVariable(b);
  });
};
Entry.VariableContainer.prototype.generateTimer = function(a) {
  a || (a = {}, a.id = Entry.generateHash(), a.name = Lang.Workspace.Variable_Timer, a.value = 0, a.variableType = "timer", a.visible = !1, a.x = 150, a.y = -70, a = new Entry.Variable(a));
  a.generateView();
  a.tick = null;
  Entry.engine.projectTimer = a;
  Entry.addEventListener("stop", function() {
    Entry.engine.stopProjectTimer();
  });
};
Entry.VariableContainer.prototype.generateAnswer = function(a) {
  a || (a = new Entry.Variable({id:Entry.generateHash(), name:Lang.Blocks.VARIABLE_get_canvas_input_value, value:0, variableType:"answer", visible:!1, x:150, y:-100}));
  a.generateView();
  Entry.container.inputValue = a;
};
Entry.VariableContainer.prototype.generateVariableSettingView = function() {
  var a = this, b = Entry.createElement("div");
  b.bindOnClick(function(b) {
    b.stopPropagation();
  });
  this.variableSettingView = b;
  b.addClass("entryVariableSettingWorkspace");
  this.listView_.appendChild(b);
  b.addClass("entryRemove");
  var c = Entry.createElement("div");
  c.addClass("entryVariableSettingVisibleWrapperWorkspace");
  c.bindOnClick(function(b) {
    b = a.selectedVariable;
    var c = a.variableSettingView.visibleCheck;
    b.setVisible(!b.isVisible());
    b.isVisible() ? c.addClass("entryVariableSettingChecked") : c.removeClass("entryVariableSettingChecked");
  });
  b.appendChild(c);
  var d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.show_variable;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableSettingCheckWorkspace");
  b.visibleCheck = d;
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableSettingInitValueWrapperWorkspace");
  b.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.default_value;
  c.appendChild(d);
  d = Entry.createElement("input");
  d.addClass("entryVariableSettingInitValueInputWorkspace");
  b.initValueInput = d;
  d.value = 0;
  d.onkeyup = function(b) {
    a.selectedVariable.setValue(this.value);
  };
  d.onblur = function(b) {
    a.selectedVariable.setValue(this.value);
  };
  b.initValueInput = d;
  c.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryVariableSettingSplitterWorkspace");
  b.appendChild(c);
  c = Entry.createElement("div");
  c.addClass("entryVariableSettingSlideWrapperWorkspace");
  b.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.slide;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryVariableSettingCheckWorkspace");
  b.slideCheck = d;
  c.appendChild(d);
  c.bindOnClick(function(b) {
    var c;
    b = a.selectedVariable;
    var d = a.variables_, f = b.getType();
    "variable" == f ? (c = b.toJSON(), c.variableType = "slide", c = new Entry.Variable(c), d.splice(d.indexOf(b), 0, c), 0 > c.getValue() && c.setValue(0), 100 < c.getValue() && c.setValue(100), e.removeAttribute("disabled"), g.removeAttribute("disabled")) : "slide" == f && (c = b.toJSON(), c.variableType = "variable", c = new Entry.Variable(c), d.splice(d.indexOf(b), 0, c), e.setAttribute("disabled", "disabled"), g.setAttribute("disabled", "disabled"));
    a.createVariableView(c);
    a.removeVariable(b);
    a.updateSelectedVariable(c);
    c.generateView();
  });
  c = Entry.createElement("div");
  b.minMaxWrapper = c;
  c.addClass("entryVariableSettingMinMaxWrapperWorkspace");
  b.appendChild(c);
  d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.min_value;
  c.appendChild(d);
  var e = Entry.createElement("input");
  e.addClass("entryVariableSettingMinValueInputWorkspace");
  d = a.selectedVariable;
  e.value = d && "slide" == d.type ? d.minValue_ : 0;
  e.onkeypress = function(b) {
    13 === b.keyCode && this.blur();
  };
  e.onblur = function(b) {
    isNaN(this.value) || (b = a.selectedVariable, b.setMinValue(this.value), a.updateVariableSettingView(b));
  };
  b.minValueInput = e;
  c.appendChild(e);
  var f = Entry.createElement("span");
  f.addClass("entryVariableSettingMaxValueSpanWorkspace");
  f.innerHTML = Lang.Workspace.max_value;
  c.appendChild(f);
  var g = Entry.createElement("input");
  g.addClass("entryVariableSettingMaxValueInputWorkspace");
  g.value = d && "slide" == d.type ? d.maxValue_ : 100;
  g.onkeypress = function(b) {
    13 === b.keyCode && this.blur();
  };
  g.onblur = function(b) {
    isNaN(this.value) || (b = a.selectedVariable, b.setMaxValue(this.value), a.updateVariableSettingView(b));
  };
  b.maxValueInput = g;
  c.appendChild(g);
};
Entry.VariableContainer.prototype.updateVariableSettingView = function(a) {
  var b = this.variableSettingView, c = b.visibleCheck, d = b.initValueInput, e = b.slideCheck, f = b.minValueInput, g = b.maxValueInput, h = b.minMaxWrapper;
  c.removeClass("entryVariableSettingChecked");
  a.isVisible() && c.addClass("entryVariableSettingChecked");
  e.removeClass("entryVariableSettingChecked");
  "slide" == a.getType() ? (e.addClass("entryVariableSettingChecked"), f.removeAttribute("disabled"), g.removeAttribute("disabled"), f.value = a.getMinValue(), g.value = a.getMaxValue(), h.removeClass("entryVariableMinMaxDisabledWorkspace")) : (h.addClass("entryVariableMinMaxDisabledWorkspace"), f.setAttribute("disabled", "disabled"), g.setAttribute("disabled", "disabled"));
  d.value = a.getValue();
  a.listElement.appendChild(b);
  b.removeClass("entryRemove");
};
Entry.VariableContainer.prototype.generateListSettingView = function() {
  var a = this, b = Entry.createElement("div");
  b.bindOnClick(function(b) {
    b.stopPropagation();
  });
  this.listSettingView = b;
  b.addClass("entryListSettingWorkspace");
  this.listView_.appendChild(b);
  b.addClass("entryRemove");
  var c = Entry.createElement("div");
  c.addClass("entryListSettingVisibleWrapperWorkspace");
  c.bindOnClick(function(b) {
    b = a.selectedList;
    var c = a.listSettingView.visibleCheck;
    b.setVisible(!b.isVisible());
    b.isVisible() ? c.addClass("entryListSettingCheckedWorkspace") : c.removeClass("entryListSettingCheckedWorkspace");
  });
  b.appendChild(c);
  var d = Entry.createElement("span");
  d.innerHTML = Lang.Workspace.show_list_workspace;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryListSettingCheckWorkspace");
  b.visibleCheck = d;
  c.appendChild(d);
  d = Entry.createElement("div");
  d.addClass("entryListSettingLengthWrapperWorkspace");
  c = Entry.createElement("span");
  c.addClass("entryListSettingLengthSpanWorkspace");
  c.innerHTML = Lang.Workspace.number_of_list;
  d.appendChild(c);
  b.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryListSettingLengthControllerWorkspace");
  d.appendChild(c);
  d = Entry.createElement("span");
  d.addClass("entryListSettingMinusWorkspace");
  d.bindOnClick(function(b) {
    a.selectedList.array_.pop();
    a.updateListSettingView(a.selectedList);
  });
  c.appendChild(d);
  d = Entry.createElement("input");
  d.addClass("entryListSettingLengthInputWorkspace");
  d.onblur = function() {
    a.setListLength(this.value);
  };
  d.onkeypress = function(b) {
    13 == b.keyCode && this.blur();
  };
  b.lengthInput = d;
  c.appendChild(d);
  d = Entry.createElement("span");
  d.addClass("entryListSettingPlusWorkspace");
  d.bindOnClick(function(b) {
    a.selectedList.array_.push({data:0});
    a.updateListSettingView(a.selectedList);
  });
  c.appendChild(d);
  c = Entry.createElement("div");
  b.seperator = c;
  b.appendChild(c);
  c.addClass("entryListSettingSeperatorWorkspace");
  c = Entry.createElement("div");
  c.addClass("entryListSettingListValuesWorkspace");
  b.listValues = c;
  b.appendChild(c);
};
Entry.VariableContainer.prototype.updateListSettingView = function(a) {
  var b = this;
  a = a || this.selectedList;
  var c = this.listSettingView, d = c.listValues, e = c.visibleCheck, f = c.lengthInput, g = c.seperator;
  e.removeClass("entryListSettingCheckedWorkspace");
  a.isVisible() && e.addClass("entryListSettingCheckedWorkspace");
  f.value = a.array_.length;
  for (a.listElement.appendChild(c);d.firstChild;) {
    d.removeChild(d.firstChild);
  }
  var h = a.array_;
  0 === h.length ? g.addClass("entryRemove") : g.removeClass("entryRemove");
  for (e = 0;e < h.length;e++) {
    (function(c) {
      var e = Entry.createElement("div");
      e.addClass("entryListSettingValueWrapperWorkspace");
      var f = Entry.createElement("span");
      f.addClass("entryListSettingValueNumberSpanWorkspace");
      f.innerHTML = c + 1;
      e.appendChild(f);
      f = Entry.createElement("input");
      f.value = h[c].data;
      f.onblur = function() {
        h[c].data = this.value;
        a.updateView();
      };
      f.onkeypress = function(b) {
        13 == b.keyCode && this.blur();
      };
      f.addClass("entryListSettingEachInputWorkspace");
      e.appendChild(f);
      f = Entry.createElement("span");
      f.bindOnClick(function() {
        h.splice(c, 1);
        b.updateListSettingView();
      });
      f.addClass("entryListSettingValueRemoveWorkspace");
      e.appendChild(f);
      d.appendChild(e);
    })(e);
  }
  a.updateView();
  c.removeClass("entryRemove");
};
Entry.VariableContainer.prototype.setListLength = function(a) {
  a = Number(a);
  var b = this.selectedList.array_;
  if (!isNaN(a)) {
    var c = b.length;
    if (c < a) {
      for (a -= c, c = 0;c < a;c++) {
        b.push({data:0});
      }
    } else {
      c > a && (b.length = a);
    }
  }
  this.updateListSettingView();
};
Entry.VariableContainer.prototype.updateViews = function() {
  var a = this.lists_;
  this.variables_.map(function(b) {
    b.updateView();
  });
  a.map(function(b) {
    b.updateView();
  });
};
Entry.VariableContainer.prototype.updateSelectedVariable = function(a, b) {
  a ? "variable" == a.type ? (this.selectedVariable = a, this.updateVariableSettingView(a)) : "slide" == a.type ? (this.selectedVariable = a, this.updateVariableSettingView(a)) : "list" == a.type && (this.selectedList = a, this.updateListSettingView(a)) : (this.selectedVariable = null, "variable" == (b || "variable") ? this.variableSettingView.addClass("entryRemove") : this.listSettingView.addClass("entryRemove"));
};
Entry.VariableContainer.prototype.removeLocalVariables = function(a) {
  var b = [], c = this;
  this.mapVariable(function(a, c) {
    a.object_ && a.object_ == c && b.push(a);
  }, a);
  b.map(function(b) {
    c.removeVariable(b);
  });
};
Entry.VariableContainer.prototype.updateCloudVariables = function() {
  var a = Entry.projectId;
  if (Entry.cloudSavable && a) {
    var b = Entry.variableContainer, a = b.variables_.filter(function(b) {
      return b.isCloud_;
    }), a = a.map(function(b) {
      return b.toJSON();
    }), b = b.lists_.filter(function(b) {
      return b.isCloud_;
    }), b = b.map(function(b) {
      return b.toJSON();
    });
    $.ajax({url:"/api/project/variable/" + Entry.projectId, type:"PUT", data:{variables:a, lists:b}}).done(function() {
    });
  }
};
Entry.VariableContainer.prototype.addRef = function(a, b) {
  if (this.view_ && Entry.playground.mainWorkspace && Entry.playground.mainWorkspace.getMode() === Entry.Workspace.MODE_BOARD) {
    var c = {object:b.getCode().object, block:b};
    b.funcBlock && (c.funcBlock = b.funcBlock, delete b.funcBlock);
    this[a].push(c);
    if ("_functionRefs" == a) {
      a = b.type.substr(5);
      for (var d = Entry.variableContainer.functions_[a].content.getBlockList(), e = 0;e < d.length;e++) {
        b = d[e];
        var f = b.events;
        -1 < b.type.indexOf("func_") && b.type.substr(5) == a || (f && f.viewAdd && f.viewAdd.forEach(function(a) {
          b.getCode().object = c.object;
          a && (b.funcBlock = c.block, a(b));
        }), f && f.dataAdd && f.dataAdd.forEach(function(a) {
          b.getCode().object = c.object;
          a && (b.funcBlock = c.block, a(b));
        }));
      }
    }
    return c;
  }
};
Entry.VariableContainer.prototype.removeRef = function(a, b) {
  if (Entry.playground.mainWorkspace && Entry.playground.mainWorkspace.getMode() === Entry.Workspace.MODE_BOARD) {
    for (var c = this[a], d = 0;d < c.length;d++) {
      if (c[d].block == b) {
        c.splice(d, 1);
        break;
      }
    }
    if ("_functionRefs" == a && (a = b.type.substr(5), d = Entry.variableContainer.functions_[a])) {
      for (c = d.content.getBlockList(), d = 0;d < c.length;d++) {
        b = c[d];
        var e = b.events;
        -1 < b.type.indexOf("func_") && b.type.substr(5) == a || (e && e.viewDestroy && e.viewDestroy.forEach(function(a) {
          a && a(b);
        }), e && e.dataDestroy && e.dataDestroy.forEach(function(a) {
          a && a(b);
        }));
      }
    }
  }
};
Entry.VariableContainer.prototype._getBlockMenu = function() {
  return Entry.playground.mainWorkspace.getBlockMenu();
};
Entry.VariableContainer.prototype._truncName = function(a, b) {
  a = a.substring(0, this._maxNameLength);
  Entry.toast.warning(Lang.Workspace[b + "_name_auto_edited_title"], Lang.Workspace[b + "_name_auto_edited_content"]);
  return a;
};
Entry.VariableContainer.prototype._maxNameLength = 10;
Entry.VariableContainer.prototype.clear = function() {
  this.variables_.map(function(b) {
    b.remove();
  });
  this.variables_ = [];
  this.lists_.map(function(b) {
    b.remove();
  });
  this.lists_ = [];
  this.messages_ = [];
  for (var a in this.functions_) {
    this.functions_[a].destroy(), delete this.functions_[a];
  }
  Entry.playground.reloadPlayground();
  this.updateList();
};
Entry.block.run = {skeleton:"basic", color:"#3BBD70", contents:["this is", "basic block"], func:function() {
}};
Entry.block.mutant = {skeleton:"basic", event:"start", color:"#3BBD70", template:"test mutant block", params:[], func:function() {
}, changeEvent:new Entry.Event};
Entry.block.jr_start = {skeleton:"pebble_event", event:"start", color:"#3BBD70", template:"%1", params:[{type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_play_image.png", highlightColor:"#3BBD70", position:{x:0, y:0}, size:22}], func:function() {
  var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b;
  for (b in a) {
    this._unit = a[b];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.jr_repeat = {skeleton:"pebble_loop", color:"#127CDB", template:"%1 \ubc18\ubcf5", params:[{type:"Text", text:Lang.Menus.repeat_0}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:3, fontSize:14, roundValue:3}, {type:"Text", text:Lang.Menus.repeat_1}], statements:[], func:function() {
  if (void 0 === this.repeatCount) {
    return this.repeatCount = this.block.params[0], Entry.STATIC.CONTINUE;
  }
  if (0 < this.repeatCount) {
    this.repeatCount--;
    var a = this.block.statements[0];
    if (0 === a.getBlocks().length) {
      return;
    }
    this.executor.stepInto(a);
    return Entry.STATIC.CONTINUE;
  }
  delete this.repeatCount;
}};
Entry.block.jr_item = {skeleton:"pebble_basic", color:"#F46C6C", template:"\uaf43 \ubaa8\uc73c\uae30 %1", params:[{type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_item_image.png", highlightColor:"#FFF", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GET_ITEM, function() {
      Ntry.dispatchEvent("getItem");
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.cparty_jr_item = {skeleton:"pebble_basic", color:"#8ABC1D", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.pick_up_pencil}, {type:"Indicator", img:"/img/assets/ntry/bitmap/cpartyjr/pen.png", highlightColor:"#FFF", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GET_ITEM, function() {
      Ntry.dispatchEvent("getItem");
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_north = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_up}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_up_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = Ntry.STATIC, b = this, c = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
          b.isAction = !1;
        });
      }, 3);
    }, d;
    switch(Ntry.unitComp.direction) {
      case Ntry.STATIC.EAST:
        d = a.TURN_LEFT;
        break;
      case Ntry.STATIC.SOUTH:
        d = a.HALF_ROTATION;
        break;
      case Ntry.STATIC.WEST:
        d = a.TURN_RIGHT;
        break;
      default:
        c();
    }
    d && Ntry.dispatchEvent("unitAction", d, c);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_east = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_right}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_right_image.png", position:{x:83, y:0}, size:22}], func:function() {
  var a = Ntry.STATIC;
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this, c = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", a.WALK, function() {
          b.isAction = !1;
        });
      }, 3);
    }, d;
    switch(Ntry.unitComp.direction) {
      case a.SOUTH:
        d = a.TURN_LEFT;
        break;
      case a.WEST:
        d = a.HALF_ROTATION;
        break;
      case a.NORTH:
        d = a.TURN_RIGHT;
        break;
      default:
        c();
    }
    d && Ntry.dispatchEvent("unitAction", d, c);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_south = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_down}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_down_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = Ntry.STATIC, b = this, c = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
          b.isAction = !1;
        });
      }, 3);
    }, d;
    switch(Ntry.unitComp.direction) {
      case a.EAST:
        d = a.TURN_RIGHT;
        break;
      case a.NORTH:
        d = a.HALF_ROTATION;
        break;
      case a.WEST:
        d = a.TURN_LEFT;
        break;
      default:
        c();
    }
    d && Ntry.dispatchEvent("unitAction", d, c);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_west = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_left}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_left_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = Ntry.STATIC, b = this, c = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", a.WALK, function() {
          b.isAction = !1;
        });
      }, 3);
    }, d;
    switch(Ntry.unitComp.direction) {
      case a.SOUTH:
        d = a.TURN_RIGHT;
        break;
      case a.EAST:
        d = a.HALF_ROTATION;
        break;
      case a.NORTH:
        d = a.TURN_LEFT;
        break;
      default:
        c();
    }
    d && Ntry.dispatchEvent("unitAction", d, c);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_start_basic = {skeleton:"basic_event", event:"start", color:"#3BBD70", template:"%1 %2", params:[{type:"Indicator", boxMultiplier:2, img:"/img/assets/block_icon/start_icon_play.png", highlightColor:"#3BBD70", size:17, position:{x:0, y:-2}}, Lang.Menus.maze_when_run], func:function() {
  var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b;
  for (b in a) {
    this._unit = a[b];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.jr_go_straight = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.go_forward, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_go_straight.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_turn_left = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.jr_turn_left, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_rotate_l.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_LEFT, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_turn_right = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.jr_turn_right, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_rotate_r.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_RIGHT, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_go_slow = {skeleton:"basic", color:"#f46c6c", template:"%1 %2", params:[Lang.Menus.go_slow, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_go_slow.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GO_SLOW, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_repeat_until_dest = {skeleton:"basic_loop", color:"#498DEB", template:"%1 %2 %3 %4", syntax:["BasicWhile", "true"], params:[Lang.Menus.repeat_until_reach_2, {type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_goal_image.png", size:18}, Lang.Menus.repeat_until_reach_1, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var a = this.block.statements[0];
  if (0 !== a.getBlocks().length) {
    return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_if_construction = {skeleton:"basic_loop", color:"#498DEB", template:"%1 %2 %3 %4", params:[Lang.Menus.jr_if_1, {type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_construction_image.png", size:18}, Lang.Menus.jr_if_2, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b, c;
    for (c in a) {
      b = a[c];
    }
    a = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.UNIT);
    b = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.GRID);
    b = {x:b.x, y:b.y};
    Ntry.addVectorByDirection(b, a.direction, 1);
    b = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:b.x, y:b.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_REPAIR});
    this.isContinue = !0;
    a = this.block.statements[0];
    if (0 !== b.length && 0 !== a.getBlocks().length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.jr_if_speed = {skeleton:"basic_loop", color:"#498DEB", template:Lang.Menus.jr_if_1 + " %1 " + Lang.Menus.jr_if_2 + " %2", params:[{type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_speed_image.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b, c;
    for (c in a) {
      b = a[c];
    }
    a = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.UNIT);
    b = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.GRID);
    b = {x:b.x, y:b.y};
    Ntry.addVectorByDirection(b, a.direction, 1);
    b = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:b.x, y:b.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_SLOW});
    this.isContinue = !0;
    a = this.block.statements[0];
    if (0 !== b.length && 0 !== a.getBlocks().length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_start = {skeleton:"basic_event", mode:"maze", event:"start", color:"#3BBD70", template:"%1 \uc2dc\uc791\ud558\uae30\ub97c \ud074\ub9ad\ud588\uc744 \ub54c", syntax:["Program"], params:[{type:"Indicator", boxMultiplier:2, img:"/img/assets/block_icon/start_icon_play.png", highlightColor:"#3BBD70", size:17, position:{x:0, y:-2}}], func:function() {
  var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b;
  for (b in a) {
    this._unit = a[b];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.maze_step_jump = {skeleton:"basic", mode:"maze", color:"#FF6E4B", template:"\ub6f0\uc5b4\ub118\uae30%1", params:[{type:"Image", img:"/img/assets/week/blocks/jump.png", size:24}], syntax:["Scope", "jump"], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.JUMP, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_for = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"%1 \ubc88 \ubc18\ubcf5\ud558\uae30%2", syntax:["BasicIteration"], params:[{type:"Dropdown", key:"REPEAT", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (void 0 === this.repeatCount) {
    return this.repeatCount = this.block.params[0], Entry.STATIC.CONTINUE;
  }
  if (0 < this.repeatCount) {
    this.repeatCount--;
    var a = this.block.statements[0];
    if (0 === a.getBlocks().length) {
      return;
    }
    this.executor.stepInto(a);
    return Entry.STATIC.CONTINUE;
  }
  delete this.repeatCount;
}};
Entry.block.test = {skeleton:"basic_boolean_field", mode:"maze", color:"#127CDB", template:"%1 this is test block %2", params:[{type:"Angle", value:"90"}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}], func:function() {
}};
Entry.block.maze_repeat_until_1 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"%1 \ub9cc\ub0a0 \ub54c \uae4c\uc9c0 \ubc18\ubcf5%2", syntax:["BasicWhile", "true"], params:[{type:"Image", img:"/img/assets/ntry/block_inner/repeat_goal_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var a = this.block.statements[0];
  if (0 !== a.getBlocks().length) {
    return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_repeat_until_2 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ubaa8\ub4e0 %1 \ub9cc\ub0a0 \ub54c \uae4c\uc9c0 \ubc18\ubcf5%2", syntax:["BasicWhile", "true"], params:[{type:"Image", img:"/img/assets/ntry/block_inner/repeat_goal_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var a = this.block.statements[0];
  if (0 !== a.getBlocks().length) {
    return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_if_1 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "wall"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b, c;
    for (c in a) {
      b = a[c];
    }
    a = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.UNIT);
    b = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.GRID);
    b = {x:b.x, y:b.y};
    Ntry.addVectorByDirection(b, a.direction, 1);
    c = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:b.x, y:b.y});
    a = this.block.statements[0];
    if (0 === c.length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
    b = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:b.x, y:b.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.WALL});
    this.isContinue = !0;
    if (0 !== b.length && 0 !== a.getBlocks().length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_if_2 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "bee"'], params:[{type:"Image", img:"/img/assets/ntry/bitmap/maze2/obstacle_01.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b, c;
    for (c in a) {
      b = a[c];
    }
    a = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.UNIT);
    b = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.GRID);
    b = {x:b.x, y:b.y};
    Ntry.addVectorByDirection(b, a.direction, 1);
    b = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:b.x, y:b.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_BEE});
    this.isContinue = !0;
    a = this.block.statements[0];
    if (0 !== b.length && 0 !== a.getBlocks().length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_call_function = {skeleton:"basic", mode:"maze", color:"#B57242", template:"\uc57d\uc18d \ubd88\ub7ec\uc624\uae30%1", syntax:["Scope", "promise"], params:[{type:"Image", img:"/img/assets/week/blocks/function.png", size:24}], func:function() {
  if (!this.funcExecutor) {
    var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.CODE), b;
    for (b in a) {
      this.funcExecutor = new Entry.Executor(a[b].components[Ntry.STATIC.CODE].code.getEventMap("define")[0]);
    }
  }
  this.funcExecutor.execute();
  if (null !== this.funcExecutor.scope.block) {
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_define_function = {skeleton:"basic_define", mode:"maze", color:"#B57242", event:"define", template:"\uc57d\uc18d\ud558\uae30%1", syntax:["BasicFunction"], params:[{type:"Image", img:"/img/assets/week/blocks/function.png", size:24}], statements:[{accept:"basic"}], func:function(a) {
  if (!this.executed && (a = this.block.statements[0], 0 !== a.getBlocks().length)) {
    return this.executor.stepInto(a), this.executed = !0, Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_if_3 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "banana"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_3.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b, c;
    for (c in a) {
      b = a[c];
    }
    a = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.UNIT);
    b = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.GRID);
    b = {x:b.x, y:b.y};
    Ntry.addVectorByDirection(b, a.direction, 1);
    b = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:b.x, y:b.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_BANANA});
    this.isContinue = !0;
    a = this.block.statements[0];
    if (0 !== b.length && 0 !== a.getBlocks().length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_if_4 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "wall"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_2.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var a = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), b, c;
    for (c in a) {
      b = a[c];
    }
    a = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.UNIT);
    b = Ntry.entityManager.getComponent(b.id, Ntry.STATIC.GRID);
    b = {x:b.x, y:b.y};
    Ntry.addVectorByDirection(b, a.direction, 1);
    b = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:b.x, y:b.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.WALL});
    this.isContinue = !0;
    a = this.block.statements[0];
    if (0 !== b.length && 0 !== a.getBlocks().length) {
      return this.executor.stepInto(a), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_move_step = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc55e\uc73c\ub85c \ud55c \uce78 \uc774\ub3d9%1", syntax:["Scope", "move"], params:[{type:"Image", img:"/img/assets/week/blocks/moveStep.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_rotate_left = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc67c\ucabd\uc73c\ub85c \ud68c\uc804%1", syntax:["Scope", "left"], params:[{type:"Image", img:"/img/assets/week/blocks/turnL.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_LEFT, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_rotate_right = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc624\ub978\ucabd\uc73c\ub85c \ud68c\uc804%1", syntax:["Scope", "right"], params:[{type:"Image", img:"/img/assets/week/blocks/turnR.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_RIGHT, function() {
      a.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.test_wrapper = {skeleton:"basic", mode:"maze", color:"#3BBD70", template:"%1 this is test block %2", params:[{type:"Block", accept:"basic_boolean_field", value:[{type:"test", params:[30, 50]}]}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}], func:function() {
}};
Entry.block.basic_button = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"basic button", color:"#333", align:"center"}], func:function() {
}};
Entry.Thread = function(a, b, c) {
  this._data = new Entry.Collection;
  this._code = b;
  this.changeEvent = new Entry.Event(this);
  this.changeEvent.attach(this, this.handleChange);
  this._event = null;
  this.parent = c ? c : b;
  this.load(a);
};
(function(a) {
  a.load = function(b, a) {
    void 0 === b && (b = []);
    if (!(b instanceof Array)) {
      return console.error("thread must be array");
    }
    for (var c = 0;c < b.length;c++) {
      var e = b[c];
      e instanceof Entry.Block || e.isDummy ? (e.setThread(this), this._data.push(e)) : this._data.push(new Entry.Block(e, this));
    }
    (b = this._code.view) && this.createView(b.board, a);
  };
  a.registerEvent = function(b, a) {
    this._event = a;
    this._code.registerEvent(b, a);
  };
  a.unregisterEvent = function(b, a) {
    this._code.unregisterEvent(b, a);
  };
  a.createView = function(b, a) {
    this.view || (this.view = new Entry.ThreadView(this, b));
    this._data.getAll().forEach(function(c) {
      c.createView(b, a);
    });
  };
  a.destroyView = function() {
    this.view = null;
    this._data.map(function(b) {
      b.destroyView();
    });
  };
  a.separate = function(b, a) {
    this._data.has(b.id) && (b = this._data.splice(this._data.indexOf(b), a), this._code.createThread(b), this.changeEvent.notify());
  };
  a.cut = function(b) {
    b = this._data.indexOf(b);
    b = this._data.splice(b);
    this.changeEvent.notify();
    return b;
  };
  a.insertByBlock = function(b, a) {
    b = b ? this._data.indexOf(b) : -1;
    for (var c = 0;c < a.length;c++) {
      a[c].setThread(this);
    }
    this._data.splice.apply(this._data, [b + 1, 0].concat(a));
    this.changeEvent.notify();
  };
  a.insertToTop = function(b) {
    b.setThread(this);
    this._data.unshift.apply(this._data, [b]);
    this.changeEvent.notify();
  };
  a.clone = function(b, a) {
    b = b || this._code;
    b = new Entry.Thread([], b);
    for (var c = this._data, e = [], f = 0, g = c.length;f < g;f++) {
      e.push(c[f].clone(b));
    }
    b.load(e, a);
    return b;
  };
  a.toJSON = function(b, a, d) {
    var c = [];
    for (a = void 0 === a ? 0 : a;a < this._data.length;a++) {
      this._data[a] instanceof Entry.Block && c.push(this._data[a].toJSON(b, d));
    }
    return c;
  };
  a.destroy = function(b, a) {
    this.view && this.view.destroy(b);
    for (var c = this._data, e = c.length - 1;0 <= e;e--) {
      c[e].destroy(b, null, a);
    }
    !c.length && this._code.destroyThread(this, !1);
  };
  a.getBlock = function(b) {
    return this._data[b];
  };
  a.getBlocks = function() {
    return this._data.map(function(b) {
      return b;
    });
  };
  a.countBlock = function() {
    for (var b = 0, a = 0;a < this._data.length;a++) {
      var d = this._data[a];
      if (d.type && (b++, d = d.statements)) {
        for (var e = 0;e < d.length;e++) {
          b += d[e].countBlock();
        }
      }
    }
    return b;
  };
  a.handleChange = function() {
    0 === this._data.length && this.destroy();
  };
  a.getCode = function() {
    return this._code;
  };
  a.setCode = function(b) {
    this._code = b;
  };
  a.spliceBlock = function(b) {
    this._data.remove(b);
    this.changeEvent.notify();
  };
  a.getFirstBlock = function() {
    return this._data[0];
  };
  a.getPrevBlock = function(b) {
    b = this._data.indexOf(b);
    return this._data.at(b - 1);
  };
  a.getNextBlock = function(b) {
    b = this._data.indexOf(b);
    return this._data.at(b + 1);
  };
  a.getLastBlock = function() {
    return this._data.at(this._data.length - 1);
  };
  a.getRootBlock = function() {
    return this._data.at(0);
  };
  a.hasBlockType = function(b) {
    function a(c) {
      if (b == c.type) {
        return !0;
      }
      for (var d = c.params, e = 0;e < d.length;e++) {
        var h = d[e];
        if (h && h.constructor == Entry.Block && a(h)) {
          return !0;
        }
      }
      if (c = c.statements) {
        for (d = 0;d < c.length;d++) {
          if (c[d].hasBlockType(b)) {
            return !0;
          }
        }
      }
      return !1;
    }
    for (var d = 0;d < this._data.length;d++) {
      if (a(this._data[d])) {
        return !0;
      }
    }
    return !1;
  };
  a.getCount = function(b) {
    var a = this._data.length;
    b && (a -= this._data.indexOf(b));
    return a;
  };
  a.indexOf = function(b) {
    return this._data.indexOf(b);
  };
  a.pointer = function(b, a) {
    a = this.indexOf(a);
    b.unshift(a);
    this.parent instanceof Entry.Block && b.unshift(this.parent.indexOfStatements(this));
    return this._code === this.parent ? (1 === this._data.length && b.shift(), b.unshift(this._code.indexOf(this)), a = this._data[0], b.unshift(a.y), b.unshift(a.x), b) : this.parent.pointer(b);
  };
  a.getBlockList = function(b, a) {
    for (var c = [], e = 0;e < this._data.length;e++) {
      var f = this._data[e];
      f.constructor === Entry.Block && (c = c.concat(f.getBlockList(b, a)));
    }
    return c;
  };
  a.stringify = function(b) {
    return JSON.stringify(this.toJSON(void 0, void 0, b));
  };
})(Entry.Thread.prototype);
Entry.skeleton = function() {
};
Entry.skeleton.basic = {path:function(a) {
  var b = a.contentWidth;
  a = a.contentHeight;
  a = Math.max(30, a + 2);
  b = Math.max(0, b + 9 - a / 2);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0,%wh h -%w l -8,8 -8,-8 v -%wh z".replace(/%wh/gi, a).replace(/%w/gi, b).replace(/%h/gi, a / 2);
}, box:function(a) {
  return {offsetX:-8, offsetY:0, width:(a ? a.contentWidth : 150) + 30, height:Math.max(30, (a ? a.contentHeight : 28) + 2), marginBottom:0};
}, magnets:function(a) {
  return {previous:{x:0, y:0}, next:{x:0, y:(a ? Math.max(a.height, 30) : 30) + 1 + a.offsetY}};
}, contentPos:function(a) {
  return {x:14, y:Math.max(a.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_create = {path:function(a) {
  var b = a.contentWidth;
  a = a.contentHeight;
  a = Math.max(30, a + 2);
  b = Math.max(0, b + 9 - a / 2);
  return "m -8,0 l 16,0 h %w a %h,%h 0 0,1 0,%wh h -%w l -8,8 -8,-8 v -%wh z".replace(/%wh/gi, a).replace(/%w/gi, b).replace(/%h/gi, a / 2);
}, box:function(a) {
  return {offsetX:-8, offsetY:0, width:(a ? a.contentWidth : 150) + 30, height:Math.max(30, (a ? a.contentHeight : 28) + 2), marginBottom:0};
}, magnets:function(a) {
  return {next:{x:0, y:(a ? Math.max(a.height, 30) : 30) + 1 + a.offsetY}};
}, contentPos:function(a) {
  return {x:14, y:Math.max(a.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_event = {path:function(a) {
  a = a.contentWidth;
  a = Math.max(0, a);
  return "m -8,0 m 0,-5 a 19.5,19.5 0, 0,1 16,0 c 10,5 15,5 20,5 h %w a 15,15 0 0,1 0,30 H 8 l -8,8 -8,-8 l 0,0.5 a 19.5,19.5 0, 0,1 0,-35 z".replace(/%w/gi, a - 30);
}, box:function(a) {
  return {offsetX:-19, offsetY:-7, width:a.contentWidth + 30, height:30, marginBottom:0};
}, magnets:function(a) {
  return {next:{x:0, y:(a ? Math.max(a.height + a.offsetY + 7, 30) : 30) + 1}};
}, contentPos:function(a) {
  return {x:1, y:15};
}};
Entry.skeleton.basic_loop = {path:function(a) {
  var b = a.contentWidth, c = a.contentHeight, c = Math.max(30, c + 2), b = Math.max(0, b + 9 - c / 2);
  a = a._statements[0] ? a._statements[0].height : 20;
  a = Math.max(a, 20);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0,%wh H 24 l -8,8 -8,-8 h -0.4 v %sh h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H 8 l -8,8 -8,-8 z".replace(/%wh/gi, c).replace(/%w/gi, b).replace(/%bw/gi, b - 8).replace(/%h/gi, c / 2).replace(/%sh/gi, a + 1);
}, magnets:function(a) {
  var b = Math.max(a.contentHeight + 2, 30), c = a._statements[0] ? a._statements[0].height : 20, c = Math.max(c, 20);
  return {previous:{x:0, y:0}, next:{x:0, y:c + b + 18 + a.offsetY}};
}, box:function(a) {
  var b = a.contentWidth, c = Math.max(a.contentHeight + 2, 30);
  a = a._statements[0] ? a._statements[0].height : 20;
  a = Math.max(a, 20);
  return {offsetX:-8, offsetY:0, width:b + 30, height:c + a + 17, marginBottom:0};
}, statementPos:function(a) {
  return [{x:16, y:Math.max(30, a.contentHeight + 2) + 1}];
}, contentPos:function(a) {
  return {x:14, y:Math.max(a.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_define = {path:function(a) {
  var b = a.contentWidth, c = a.contentHeight, c = Math.max(30, c + 2), b = Math.max(0, b + 9 - c / 2);
  a = a._statements[0] ? a._statements[0].height : 30;
  a = Math.max(a, 20);
  return "m -8,0 l 16,0 h %w a %h,%h 0 0,1 0,%wh H 24 l -8,8 -8,-8 h -0.4 v %sh h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H -8 z".replace(/%wh/gi, c).replace(/%w/gi, b).replace(/%h/gi, c / 2).replace(/%bw/gi, b - 8).replace(/%sh/gi, a + 1);
}, magnets:function() {
  return {};
}, box:function(a) {
  return {offsetX:0, offsetY:0, width:a.contentWidth, height:Math.max(a.contentHeight, 25) + 46, marginBottom:0};
}, statementPos:function(a) {
  return [{x:16, y:Math.max(30, a.contentHeight + 2)}];
}, contentPos:function() {
  return {x:14, y:15};
}};
Entry.skeleton.pebble_event = {path:function(a) {
  return "m 0,0 a 25,25 0 0,1 9,48.3 a 9,9 0 0,1 -18,0 a 25,25 0 0,1 9,-48.3 z";
}, box:function(a) {
  return {offsetX:-25, offsetY:0, width:50, height:48.3, marginBottom:0};
}, magnets:function(a) {
  return {next:{x:0, y:(a ? Math.max(a.height, 49.3) : 49.3) + a.offsetY}};
}, contentPos:function() {
  return {x:0, y:25};
}};
Entry.skeleton.pebble_loop = {fontSize:16, dropdownHeight:23, path:function(a) {
  a = Math.max(a._statements[0] ? a._statements[0].height : 50, 50);
  return "M 0,9 a 9,9 0 0,0 9,-9 h %cw q 25,0 25,25 v %ch q 0,25 -25,25 h -%cw a 9,9 0 0,1 -18,0 h -%cw q -25,0 -25,-25 v -%ch q 0,-25 25,-25 h %cw a 9,9 0 0,0 9,9 M 0,49 a 9,9 0 0,1 -9,-9 h -28 a 25,25 0 0,0 -25,25 v %cih a 25,25 0 0,0 25,25 h 28 a 9,9 0 0,0 18,0 h 28 a 25,25 0 0,0 25,-25 v -%cih a 25,25 0 0,0 -25,-25 h -28 a 9,9 0 0,1 -9,9 z".replace(/%cw/gi, 41).replace(/%ch/gi, a + 4).replace(/%cih/gi, a - 50);
}, magnets:function(a) {
  var b = Math.max(a.contentHeight + 2, 41), c = a._statements[0] ? a._statements[0].height : 20, c = Math.max(c, 51);
  return {previous:{x:0, y:0}, next:{x:0, y:c + b + 13 + a.offsetY}};
}, box:function(a) {
  var b = a.contentWidth, c = Math.max(a.contentHeight + 2, 41);
  a = a._statements[0] ? a._statements[0].height : 20;
  a = Math.max(a, 51);
  return {offsetX:-(b / 2 + 13), offsetY:0, width:b + 30, height:c + a + 13, marginBottom:0};
}, statementPos:function(a) {
  return [{x:0, y:Math.max(39, a.contentHeight + 2) + 1.5}];
}, contentPos:function() {
  return {x:-46, y:25};
}};
Entry.skeleton.pebble_basic = {fontSize:15, morph:["prev", "next"], path:function(a) {
  return "m 0,9 a 9,9 0 0,0 9,-9 h 28 q 25,0 25,25q 0,25 -25,25h -28 a 9,9 0 0,1 -18,0 h -28 q -25,0 -25,-25q 0,-25 25,-25h 28 a 9,9 0 0,0 9,9 z";
}, magnets:function(a) {
  return {previous:{x:0, y:0}, next:{x:0, y:(a ? Math.max(a.height, 51) : 51) + a.offsetY}};
}, box:function() {
  return {offsetX:-62, offsetY:0, width:124, height:50, marginBottom:0};
}, contentPos:function() {
  return {x:-46, y:25};
}};
Entry.skeleton.basic_string_field = {path:function(a) {
  var b = a.contentWidth;
  a = a.contentHeight;
  a = Math.max(18, a + 2);
  b = Math.max(0, b - a + 12);
  return "m %h,0 h %w a %h,%h 0 1,1 0,%wh H %h A %h,%h 0 1,1 %h,0 z".replace(/%wh/gi, a).replace(/%w/gi, b).replace(/%h/gi, a / 2);
}, color:"#000", outerLine:"#768dce", box:function(a) {
  return {offsetX:0, offsetY:0, width:(a ? a.contentWidth : 5) + 12, height:Math.max((a ? a.contentHeight : 18) + 2, 18), marginBottom:0};
}, magnets:function() {
  return {string:{}};
}, contentPos:function(a) {
  return {x:6, y:Math.max(a.contentHeight, 16) / 2 + 1};
}};
Entry.skeleton.basic_boolean_field = {path:function(a) {
  var b = a.contentWidth;
  a = a.contentHeight;
  a = Math.max(18, a + 2);
  b = Math.max(0, b - a + 19);
  return "m %h,0 h %w l %h,%h -%h,%h H %h l -%h,-%h %h,-%h z".replace(/%wh/gi, a).replace(/%w/gi, b).replace(/%h/gi, a / 2);
}, color:"#000", outerLine:"#768dce", box:function(a) {
  return {offsetX:0, offsetY:0, width:(a ? a.contentWidth : 5) + 19, height:Math.max((a ? a.contentHeight : 18) + 2, 18), marginBottom:0};
}, magnets:function() {
  return {boolean:{}};
}, contentPos:function(a) {
  return {x:10, y:Math.max(a.contentHeight, 16) / 2 + 1};
}};
Entry.skeleton.basic_param = {path:function(a) {
  var b = a.contentWidth;
  (a = a._contents[a._contents.length - 1]) && (b -= a.box.width + Entry.BlockView.PARAM_SPACE - 2);
  b = Math.max(0, b);
  return "m 4,0 h 10 h %w l 2,2 0,3 3,0 1,1 0,12 -1,1 -3,0 0,3 -2,2h -%w h -10 l -2,-2 0,-3 3,0 1,-1 0,-12 -1,-1 -3,0 0,-3 2,-2".replace(/%w/gi, b);
}, outerLine:"#768dce", box:function(a) {
  return {offsetX:0, offsetY:0, width:(a ? a.contentWidth : 5) + 11, height:24, marginBottom:0};
}, magnets:function() {
  return {param:{}};
}, contentPos:function(a) {
  return {x:11, y:12};
}};
Entry.skeleton.basic_button = {path:function() {
  return "m -64,0 h 128 a 6,6 0, 0,1 6,6 v 18 a 6,6 0, 0,1 -6,6 h -128 a 6,6 0, 0,1 -6,-6 v -18 a 6,6 0, 0,1 6,-6 z";
}, box:function() {
  return {offsetX:-80, offsetY:0, width:140, height:30};
}, contentPos:function() {
  return {x:0, y:15};
}, movable:!1, readOnly:!0, nextShadow:!0, classes:["basicButtonView"]};
Entry.skeleton.basic_without_next = {box:Entry.skeleton.basic.box, contentPos:Entry.skeleton.basic.contentPos, path:function(a) {
  var b = a.contentWidth;
  a = a.contentHeight;
  a = Math.max(30, a + 2);
  b = Math.max(0, b + 9 - a / 2);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0, %wh H -8 z".replace(/%wh/gi, a).replace(/%w/gi, b).replace(/%h/gi, a / 2);
}, magnets:function(a) {
  return {previous:{x:0, y:0}};
}};
Entry.skeleton.basic_double_loop = {path:function(a) {
  var b = a.contentWidth, c = a.contentHeight % 1E6, d = Math.floor(a.contentHeight / 1E6), c = Math.max(30, c + 2), d = Math.max(30, d + 2), b = Math.max(0, b + 5 - c / 2), e = a._statements;
  a = e[0] ? e[0].height : 20;
  e = e[1] ? e[1].height : 20;
  a = Math.max(a, 20);
  e = Math.max(e, 20);
  return "m -8,0 l 8,8 8,-8 h %w a %h1,%h1 0 0,1 0,%wh1 H 24 l -8,8 -8,-8 h -0.4 v %sh1 h 0.4 l 8,8 8,-8 h %bw a %h2,%h2 0 0,1 0,%wh2 H 24 l -8,8 -8,-8 h -0.4 v %sh2 h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H 8 l -8,8 -8,-8 z".replace(/%wh1/gi, c).replace(/%wh2/gi, d).replace(/%w/gi, b).replace(/%bw/gi, b - 8).replace(/%h1/gi, c / 2).replace(/%h2/gi, d / 2).replace(/%sh1/gi, a + 1).replace(/%sh2/gi, e + 1);
}, magnets:function(a) {
  var b = Math.max(a.contentHeight % 1E6 + 2, 30), c = Math.max(Math.floor(a.contentHeight / 1E6) + 2, 30), d = a._statements[0] ? a._statements[0].height : 20, e = a._statements[1] ? a._statements[1].height : 20, d = Math.max(d, 20), e = Math.max(e, 20);
  return {previous:{x:0, y:0}, next:{x:0, y:d + e + b + c + 19 + a.offsetY}};
}, box:function(a) {
  var b = a.contentWidth, c = Math.max(Math.floor(a.contentHeight / 1E6) + 2, 30), d = Math.max(a.contentHeight % 1E6 + 2, 30), e = a._statements[0] ? a._statements[0].height % 1E6 : 20;
  a = a._statements[1] ? a._statements[1].height : 20;
  e = Math.max(e, 20);
  a = Math.max(a, 20);
  return {offsetX:-8, offsetY:0, width:b + 30, height:c + d + e + a + 17, marginBottom:0};
}, statementPos:function(a) {
  var b = Math.max(30, a.contentHeight % 1E6 + 2) + 1;
  return [{x:16, y:b}, {x:16, y:b + Math.max(a._statements[0] ? a._statements[0].height % 1E6 : 20, 20) + Math.max(Math.floor(a.contentHeight / 1E6) + 2, 30) + 1}];
}, contentPos:function(a) {
  return {x:14, y:Math.max(a.contentHeight % 1E6, 28) / 2 + 1};
}};
Entry.Block = function(a, b) {
  var c = this;
  Entry.Model(this, !1);
  this._schema = null;
  this.setThread(b);
  this.load(a);
  a = this.getCode();
  a.registerBlock(this);
  (b = this.events.dataAdd) && a.object && b.forEach(function(b) {
    Entry.Utils.isFunction(b) && b(c);
  });
};
Entry.Block.MAGNET_RANGE = 10;
Entry.Block.MAGNET_OFFSET = .4;
Entry.Block.DELETABLE_TRUE = 1;
Entry.Block.DELETABLE_FALSE = 2;
Entry.Block.DELETABLE_FALSE_LIGHTEN = 3;
(function(a) {
  a.schema = {id:null, x:0, y:0, type:null, params:[], statements:[], view:null, thread:null, movable:null, deletable:Entry.Block.DELETABLE_TRUE, readOnly:null, copyable:!0, events:{}, extensions:[]};
  a.load = function(b) {
    b.id || (b.id = Entry.Utils.generateId());
    this.set(b);
    this.loadSchema();
  };
  a.changeSchema = function(b) {
    this.set({params:[]});
    this.loadSchema();
  };
  a.getSchema = function() {
    this._schema || this.loadSchema();
    return this._schema;
  };
  a.loadSchema = function() {
    if (this._schema = Entry.block[this.type]) {
      !this._schemaChangeEvent && this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this.changeSchema));
      var b = this._schema.events;
      if (b) {
        for (var a in b) {
          this.events[a] || (this.events[a] = []);
          for (var d = b[a], e = 0;e < d.length;e++) {
            var f = d[e];
            f && 0 > this.events[a].indexOf(f) && this.events[a].push(f);
          }
        }
      }
      this._schema.event && this.thread.registerEvent(this, this._schema.event);
      b = this.params;
      a = this._schema.params;
      for (e = 0;a && e < a.length;e++) {
        d = void 0 === b[e] || null === b[e] ? a[e].value : b[e], f = b[e] || e < b.length, !d || "Output" !== a[e].type && "Block" !== a[e].type || (d = new Entry.Block(d, this.thread)), f ? b.splice(e, 1, d) : b.push(d);
      }
      if (b = this._schema.statements) {
        for (e = 0;e < b.length;e++) {
          this.statements.splice(e, 1, new Entry.Thread(this.statements[e], this.getCode(), this));
        }
      }
    }
  };
  a.changeType = function(b) {
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
    this.set({type:b});
    this.loadSchema();
    this.view && this.view.changeType(b);
  };
  a.setThread = function(b) {
    this.set({thread:b});
  };
  a.getThread = function() {
    return this.thread;
  };
  a.insertAfter = function(b) {
    this.thread.insertByBlock(this, b);
  };
  a._updatePos = function() {
    this.view && this.set({x:this.view.x, y:this.view.y});
  };
  a.moveTo = function(b, a) {
    this.view && this.view._moveTo(b, a);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  a.createView = function(b, a) {
    this.view || (this.set({view:new Entry.BlockView(this, b, a)}), this._updatePos());
  };
  a.destroyView = function() {
    this.view.destroy();
    this.set({view:null});
  };
  a.clone = function(b) {
    return new Entry.Block(this.toJSON(!0), b);
  };
  a.toJSON = function(b, a) {
    var c = this._toJSON();
    delete c.view;
    delete c.thread;
    delete c.events;
    b && delete c.id;
    c.params = c.params.map(function(c) {
      c instanceof Entry.Block && (c = c.toJSON(b, a));
      return c;
    });
    c.statements = c.statements.map(function(c) {
      return c.toJSON(b, void 0, a);
    });
    c.x = this.x;
    c.y = this.y;
    c.movable = this.movable;
    c.deletable = this.deletable;
    c.readOnly = this.readOnly;
    a && a instanceof Array && a.forEach(function(b) {
      delete c[b];
    });
    return c;
  };
  a.destroy = function(b, a, d) {
    if (!d || this.deletable === Entry.Block.DELETABLE_TRUE) {
      var c = this, f = this.params;
      if (f) {
        for (d = 0;d < f.length;d++) {
          var g = f[d];
          g instanceof Entry.Block && (g.doNotSplice = !0, g.destroy(b));
        }
      }
      if (f = this.statements) {
        for (d = 0;d < f.length;d++) {
          f[d].destroy(b);
        }
      }
      g = this.getPrevBlock();
      d = this.getNextBlock();
      this.getCode().unregisterBlock(this);
      f = this.getThread();
      this._schema && this._schema.event && f.unregisterEvent(this, this._schema.event);
      d && (a ? d.destroy(b, a) : g ? d.view && d.view.bindPrev(g, !0) : (a = this.getThread().view.getParent(), a.constructor === Entry.FieldStatement ? (d.view && d.view.bindPrev(a), a.insertTopBlock(d)) : a.constructor === Entry.FieldStatement ? d.replace(a._valueBlock) : d.view._toGlobalCoordinate()));
      !this.doNotSplice && f.spliceBlock ? f.spliceBlock(this) : delete this.doNotSplice;
      this.view && this.view.destroy(b);
      this._schemaChangeEvent && this._schemaChangeEvent.destroy();
      (b = this.events.dataDestroy) && this.getCode().object && b.forEach(function(b) {
        Entry.Utils.isFunction(b) && b(c);
      });
    }
  };
  a.getView = function() {
    return this.view;
  };
  a.setMovable = function(b) {
    this.movable != b && this.set({movable:b});
  };
  a.setCopyable = function(b) {
    this.copyable != b && this.set({copyable:b});
  };
  a.isMovable = function() {
    return this.movable;
  };
  a.isCopyable = function() {
    return this.copyable;
  };
  a.setDeletable = function(b) {
    this.deletable != b && this.set({deletable:b});
  };
  a.isDeletable = function() {
    return this.deletable === Entry.Block.DELETABLE_TRUE;
  };
  a.isReadOnly = function() {
    return this.readOnly;
  };
  a.getCode = function() {
    return this.thread.getCode();
  };
  a.doAdd = function() {
    this.getCode().changeEvent.notify();
  };
  a.doMove = function() {
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  a.doSeparate = function() {
    this.separate();
  };
  a.doInsert = function(b) {
    "basic" === this.getBlockType() ? this.insert(b) : this.replace(b);
  };
  a.doDestroy = function(b) {
    this.destroy(b);
    this.getCode().changeEvent.notify();
    return this;
  };
  a.doDestroyBelow = function(b) {
    console.log("destroyBelow", this.id, this.x, this.y);
    this.destroy(b, !0);
    this.getCode().changeEvent.notify();
    return this;
  };
  a.copy = function() {
    var b = this.getThread(), a = [];
    if (b instanceof Entry.Thread) {
      for (var d = b.getBlocks().indexOf(this), b = b.toJSON(!0, d), d = 0;d < b.length;d++) {
        a.push(b[d]);
      }
    } else {
      a.push(this.toJSON(!0));
    }
    b = this.view.getAbsoluteCoordinate();
    d = a[0];
    d.x = b.x + 15;
    d.y = b.y + 15;
    d.id = Entry.Utils.generateId();
    return a;
  };
  a.copyToClipboard = function() {
    Entry.clipboard = this.copy();
  };
  a.separate = function(b) {
    this.thread.separate(this, b);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  a.insert = function(b) {
    var a = this.thread.cut(this);
    b instanceof Entry.Thread ? b.insertByBlock(null, a) : b.insertAfter(a);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  a.replace = function(b) {
    this.thread.cut(this);
    b.getThread().replace(this);
    this.getCode().changeEvent.notify();
  };
  a.getPrevBlock = function() {
    return this.thread.getPrevBlock(this);
  };
  a.getNextBlock = function() {
    return this.thread.getNextBlock(this) || null;
  };
  a.getLastBlock = function() {
    return this.thread.getLastBlock();
  };
  a.getOutputBlock = function() {
    for (var b = this._schema.params, a = 0;b && a < b.length;a++) {
      if ("Output" === b[a].type) {
        return this.params[a];
      }
    }
    return null;
  };
  a.getTerminateOutputBlock = function() {
    for (var b = this;;) {
      var a = b.getOutputBlock();
      if (!a) {
        return b;
      }
      b = a;
    }
  };
  a.getBlockType = function() {
    if (!this.view) {
      return null;
    }
    var b = Entry.skeleton[this._schema.skeleton].magnets(this.view);
    return b.next || b.previous ? "basic" : b.boolean || b.string ? "field" : b.output ? "output" : null;
  };
  a.indexOfStatements = function(b) {
    return this.statements.indexOf(b);
  };
  a.pointer = function(b) {
    b || (b = []);
    return this.thread.pointer(b, this);
  };
  a.targetPointer = function() {
    var b = this.thread.pointer([], this);
    4 === b.length && 0 === b[3] && b.pop();
    return b;
  };
  a.getDataByPointer = function(b) {
    b = b.concat();
    var a = this.params[b.shift()];
    return b.length ? a.getDataByPointer ? a.getDataByPointer(b) : null : a;
  };
  a.getBlockList = function(b, a) {
    var c = [];
    if (!this._schema) {
      return [];
    }
    if (b && this._schema.isPrimitive) {
      return c;
    }
    (a || this.type) === this.type && c.push(this);
    for (var e = this.params, f = 0;f < e.length;f++) {
      var g = e[f];
      g && g.constructor == Entry.Block && (c = c.concat(g.getBlockList(b, a)));
    }
    if (e = this.statements) {
      for (f = 0;f < e.length;f++) {
        g = e[f], g.constructor === Entry.Thread && (c = c.concat(g.getBlockList(b, a)));
      }
    }
    return c;
  };
  a.stringify = function(b) {
    return JSON.stringify(this.toJSON(!1, b));
  };
})(Entry.Block.prototype);
Entry.BlockMenu = function(a, b, c, d) {
  Entry.Model(this, !1);
  this._align = b || "CENTER";
  this.setAlign(this._align);
  this._scroll = void 0 !== d ? d : !1;
  this._bannedClass = [];
  this._categories = [];
  this.suffix = "blockMenu";
  this._isSelectingMenu = !1;
  a = "string" === typeof a ? $("#" + a) : $(a);
  if ("DIV" !== a.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.view = a;
  this.visible = !0;
  this._svgId = "blockMenu" + (new Date).getTime();
  this._clearCategory();
  this._categoryData = c;
  this._generateView(c);
  this._splitters = [];
  this.setWidth();
  this.svg = Entry.SVG(this._svgId);
  Entry.Utils.addFilters(this.svg, this.suffix);
  this.pattern = Entry.Utils.addBlockPattern(this.svg, this.suffix).pattern;
  this.svgGroup = this.svg.elem("g");
  this.svgThreadGroup = this.svgGroup.elem("g");
  this.svgThreadGroup.board = this;
  this.svgBlockGroup = this.svgGroup.elem("g");
  this.svgBlockGroup.board = this;
  this.changeEvent = new Entry.Event(this);
  c && this._generateCategoryCodes(c);
  this.observe(this, "_handleDragBlock", ["dragBlock"]);
  this._scroll && (this._scroller = new Entry.BlockMenuScroller(this), this._addControl(a));
  Entry.documentMousedown && Entry.documentMousedown.attach(this, this.setSelectedBlock);
  this._categoryCodes && Entry.keyPressed && Entry.keyPressed.attach(this, this._captureKeyEvent);
  Entry.windowResized && (a = _.debounce(this.updateOffset, 200), Entry.windowResized.attach(this, a));
};
(function(a) {
  a.schema = {code:null, dragBlock:null, closeBlock:null, selectedBlockView:null};
  a._generateView = function(b) {
    var a = this.view, d = this;
    b && (this._categoryCol = Entry.Dom("ul", {class:"entryCategoryListWorkspace", parent:a}), this._generateCategoryView(b));
    this.blockMenuContainer = Entry.Dom("div", {"class":"blockMenuContainer", parent:a});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="blockMenu" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.blockMenuContainer});
    this.svgDom.mouseenter(function(b) {
      d._scroller && d._scroller.setOpacity(1);
      b = d.workspace.selectedBlockView;
      !Entry.playground || Entry.playground.resizing || b && b.dragMode === Entry.DRAG_MODE_DRAG || (Entry.playground.focusBlockMenu = !0, b = d.svgGroup.getBBox(), b = b.width + b.x + 64, b > Entry.interfaceState.menuWidth && (this.widthBackup = Entry.interfaceState.menuWidth - 64, $(this).stop().animate({width:b - 62}, 200)));
    });
    this.svgDom.mouseleave(function(b) {
      Entry.playground && !Entry.playground.resizing && (d._scroller && d._scroller.setOpacity(0), (b = this.widthBackup) && $(this).stop().animate({width:b}, 200), delete this.widthBackup, delete Entry.playground.focusBlockMenu);
    });
    $(window).scroll(function() {
      d.updateOffset();
    });
  };
  a.changeCode = function(b) {
    if (!(b instanceof Entry.Code)) {
      return console.error("You must inject code instance");
    }
    this.codeListener && this.code.changeEvent.detach(this.codeListener);
    var a = this;
    this.set({code:b});
    this.codeListener = this.code.changeEvent.attach(this, function() {
      a.changeEvent.notify();
    });
    b.createView(this);
    this.workspace.getMode();
    this.workspace.getMode() === Entry.Workspace.MODE_VIMBOARD ? b.mode && "code" !== b.mode || this.renderText() : "text" === b.mode && this.renderBlock();
    this.align();
  };
  a.bindCodeView = function(b) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = b.svgBlockGroup;
    this.svgThreadGroup = b.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
    this._scroller && this.svgGroup.appendChild(this._scroller.svgGroup);
  };
  a.align = function(b) {
    var a = this.code;
    if (a) {
      this._clearSplitters();
      !a.view || b || this._isSelectingMenu || a.view.reDraw();
      b = a.getThreads();
      for (var a = 10, d = "LEFT" == this._align ? 10 : this.svgDom.width() / 2, e, f = 0, g = b.length;f < g;f++) {
        var h = b[f].getFirstBlock(), k = h.view, h = Entry.block[h.type];
        this.checkBanClass(h) ? k.set({display:!1}) : (k.set({display:!0}), h = h.class, e && e !== h && (this._createSplitter(a), a += 15), e = h, h = d - k.offsetX, "CENTER" == this._align && (h -= k.width / 2), a -= k.offsetY, k._moveTo(h, a, !1), a += k.height + 15);
      }
      this.updateSplitters();
      this.changeEvent.notify();
    }
  };
  a.cloneToGlobal = function(b) {
    if (!this._boardBlockView && null !== this.dragBlock) {
      var a = this.workspace, d = a.getMode(), e = this.dragBlock, f = this._svgWidth, g = a.selectedBoard;
      if (!g || d != Entry.Workspace.MODE_BOARD && d != Entry.Workspace.MODE_OVERLAYBOARD) {
        Entry.GlobalSvg.setView(e, a.getMode()) && Entry.GlobalSvg.addControl(b);
      } else {
        if (g.code && (a = e.block, d = a.getThread(), a && d)) {
          a = d.toJSON(!0);
          this._boardBlockView = Entry.do("addThread", a).value.getFirstBlock().view;
          var g = this.offset().top - g.offset().top - $(window).scrollTop(), h, k;
          if (a = this.dragBlock.mouseDownCoordinate) {
            h = b.pageX - a.x, k = b.pageY - a.y;
          }
          this._boardBlockView._moveTo(e.x - f + (h || 0), e.y + g + (k || 0), !1);
          this._boardBlockView.onMouseDown.call(this._boardBlockView, b);
          this._boardBlockView.dragInstance.set({isNew:!0});
        }
      }
    }
  };
  a.terminateDrag = function() {
    if (this._boardBlockView) {
      var b = this._boardBlockView;
      if (b) {
        this.workspace.getBoard();
        this._boardBlockView = null;
        var a = Entry.GlobalSvg.left, d = Entry.GlobalSvg.width / 2, b = b.getBoard().offset().left;
        return a < b - d;
      }
    }
  };
  a.getCode = function(b) {
    return this._code;
  };
  a.setSelectedBlock = function(b) {
    var a = this.selectedBlockView;
    a && a.removeSelected();
    b instanceof Entry.BlockView ? b.addSelected() : b = null;
    this.set({selectedBlockView:b});
  };
  a.hide = function() {
    this.view.addClass("entryRemove");
  };
  a.show = function() {
    this.view.removeClass("entryRemove");
  };
  a.renderText = function(b) {
    var a = this.code.getThreads();
    this.code.mode = "text";
    for (var d = 0;d < a.length;d++) {
      a[d].view.renderText();
    }
    b && b();
  };
  a.renderBlock = function(b) {
    var a = this.code.getThreads();
    this.code.mode = "code";
    for (var d = 0;d < a.length;d++) {
      a[d].view.renderBlock();
    }
    b && b();
  };
  a._createSplitter = function(b) {
    b = this.svgBlockGroup.elem("line", {x1:20, y1:b, x2:this._svgWidth - 20, y2:b, stroke:"#b5b5b5"});
    this._splitters.push(b);
  };
  a.updateSplitters = function(b) {
    b = void 0 === b ? 0 : b;
    var a = this._svgWidth - 20, d;
    this._splitters.forEach(function(c) {
      d = parseFloat(c.getAttribute("y1")) + b;
      c.attr({x2:a, y1:d, y2:d});
    });
  };
  a._clearSplitters = function() {
    for (var b = this._splitters, a = b.length - 1;0 <= a;a--) {
      b[a].remove(), b.pop();
    }
  };
  a.setWidth = function() {
    this._svgWidth = this.blockMenuContainer.width();
    this.updateSplitters();
  };
  a.setMenu = function() {
    var b = this._categoryCodes, a = this._categoryElems, d;
    for (d in b) {
      for (var e = b[d], e = e instanceof Entry.Code ? e.getThreads() : e, f = e.length, g = 0;g < e.length;g++) {
        var h = e[g], h = h instanceof Entry.Thread ? h.getFirstBlock().type : h[0].type;
        this.checkBanClass(Entry.block[h]) && f--;
      }
      0 === f ? a[d].addClass("entryRemove") : a[d].removeClass("entryRemove");
    }
  };
  a.getCategoryCodes = function(b) {
    b = this._convertSelector(b);
    var a = this._categoryCodes[b];
    a || (this._generateCategoryElement(b), a = []);
    a instanceof Entry.Code || (a = this._categoryCodes[b] = new Entry.Code(a));
    return a;
  };
  a._convertSelector = function(b) {
    if (isNaN(b)) {
      return b;
    }
    b = Number(b);
    for (var a = this._categories, d = this._categoryElems, e = 0;e < a.length;e++) {
      var f = a[e];
      if (!d[f].hasClass("entryRemove") && 0 === b--) {
        return f;
      }
    }
  };
  a.selectMenu = function(b, a) {
    if (b = this._convertSelector(b)) {
      this._isSelectingMenu = !0;
      switch(b) {
        case "variable":
          Entry.playground.checkVariables();
          break;
        case "arduino":
          this._generateHwCode();
      }
      var c = this._categoryElems[b], e = this._selectedCategoryView, f = !1, g = this.workspace.board, h = g.view;
      e && e.removeClass("entrySelectedCategory");
      c != e || a ? e || (this.visible || (f = !0, h.addClass("foldOut"), Entry.playground.showTabs()), h.removeClass("folding"), this.visible = !0) : (h.addClass("folding"), this._selectedCategoryView = null, c.removeClass("entrySelectedCategory"), Entry.playground.hideTabs(), f = !0, this.visible = !1);
      f && Entry.bindAnimationCallbackOnce(h, function() {
        g.scroller.resizeScrollBar.call(g.scroller);
        h.removeClass("foldOut");
        Entry.windowResized.notify();
      });
      this._isSelectingMenu = !1;
      this.visible && (a = this._categoryCodes[b], this._selectedCategoryView = c, c.addClass("entrySelectedCategory"), a.constructor !== Entry.Code && (a = this._categoryCodes[b] = new Entry.Code(a)), this.changeCode(a));
      this.lastSelector = b;
    } else {
      this.align();
    }
  };
  a._generateCategoryCodes = function(b) {
    this._categoryCodes = {};
    for (var a = 0;a < b.length;a++) {
      var d = b[a], e = [];
      d.blocks.forEach(function(b) {
        var a = Entry.block[b];
        if (a && a.def) {
          if (a.defs) {
            for (b = 0;b < a.defs.length;b++) {
              e.push([a.defs[b]]);
            }
          } else {
            e.push([a.def]);
          }
        } else {
          e.push([{type:b}]);
        }
      });
      d = d.category;
      this._categories.push(d);
      this._categoryCodes[d] = e;
    }
  };
  a.banClass = function(b, a) {
    0 > this._bannedClass.indexOf(b) && this._bannedClass.push(b);
    this.align(a);
  };
  a.unbanClass = function(b, a) {
    b = this._bannedClass.indexOf(b);
    -1 < b && this._bannedClass.splice(b, 1);
    this.align(a);
  };
  a.checkBanClass = function(b) {
    if (b) {
      b = b.isNotFor;
      for (var a in this._bannedClass) {
        if (b && -1 < b.indexOf(this._bannedClass[a])) {
          return !0;
        }
      }
      return !1;
    }
  };
  a._addControl = function(b) {
    var a = this;
    b.on("wheel", function() {
      a._mouseWheel.apply(a, arguments);
    });
    a._scroller && $(this.svg).bind("mousedown touchstart", function(b) {
      a.onMouseDown.apply(a, arguments);
    });
  };
  a.onMouseDown = function(b) {
    function a(b) {
      b.stopPropagation && b.stopPropagation();
      b.preventDefault && b.preventDefault();
      b = Entry.Utils.convertMouseEvent(b);
      var a = e.dragInstance;
      e._scroller.scroll(-b.pageY + a.offsetY);
      a.set({offsetY:b.pageY});
    }
    function d(b) {
      $(document).unbind(".blockMenu");
      delete e.dragInstance;
    }
    b.stopPropagation && b.stopPropagation();
    b.preventDefault && b.preventDefault();
    var e = this;
    if (0 === b.button || b.originalEvent && b.originalEvent.touches) {
      b = Entry.Utils.convertMouseEvent(b);
      Entry.documentMousedown && Entry.documentMousedown.notify(b);
      var f = $(document);
      f.bind("mousemove.blockMenu", a);
      f.bind("mouseup.blockMenu", d);
      f.bind("touchmove.blockMenu", a);
      f.bind("touchend.blockMenu", d);
      this.dragInstance = new Entry.DragInstance({startY:b.pageY, offsetY:b.pageY});
    }
  };
  a._mouseWheel = function(b) {
    b = b.originalEvent;
    b.preventDefault();
    var a = Entry.disposeEvent;
    a && a.notify(b);
    this._scroller.scroll(-b.wheelDeltaY || b.deltaY / 3);
  };
  a.dominate = function(b) {
    this.svgBlockGroup.appendChild(b.view.svgGroup);
  };
  a.reDraw = function() {
    this.selectMenu(this.lastSelector, !0);
  };
  a._handleDragBlock = function() {
    this._boardBlockView = null;
    this._scroller && this._scroller.setOpacity(0);
  };
  a._captureKeyEvent = function(b) {
    var a = b.keyCode, d = Entry.type;
    b.ctrlKey && "workspace" == d && 48 < a && 58 > a && (b.preventDefault(), this.selectMenu(a - 49));
  };
  a.enablePattern = function() {
    this.pattern.removeAttribute("style");
  };
  a.disablePattern = function() {
    this.pattern.attr({style:"display: none"});
  };
  a._clearCategory = function() {
    this._selectedCategoryView = null;
    this._categories = [];
    var b = this._categoryElems, a;
    for (a in b) {
      b[a].remove();
    }
    this._categoryElems = {};
    b = this._categoryCodes;
    for (a in b) {
      var d = b[a];
      d.constructor == Entry.Code && d.clear();
    }
    this._categoryCodes = null;
  };
  a.setCategoryData = function(b) {
    this._clearCategory();
    this._categoryData = b;
    this._generateCategoryView(b);
    this._generateCategoryCodes(b);
  };
  a._generateCategoryView = function(b) {
    if (b) {
      for (var a = 0;a < b.length;a++) {
        this._generateCategoryElement(b[a].category);
      }
    }
  };
  a._generateCategoryElement = function(b) {
    var a = this;
    (function(b, c) {
      b.text(Lang.Blocks[c.toUpperCase()]);
      a._categoryElems[c] = b;
      b.bindOnClick(function(b) {
        a.selectMenu(c);
      });
    })(Entry.Dom("li", {id:"entryCategory" + b, class:"entryCategoryElementWorkspace", parent:this._categoryCol}), b);
  };
  a.updateOffset = function() {
    this._offset = this.svgDom.offset();
  };
  a.offset = function() {
    (!this._offset || 0 === this._offset.top && 0 === this._offset.left) && this.updateOffset();
    return this._offset;
  };
  a._generateHwCode = function() {
    var b = this._categoryCodes.arduino;
    b instanceof Entry.Code && b.clear();
    for (var a = this._categoryData, d, b = a.length - 1;0 <= b;b--) {
      if ("arduino" === a[b].category) {
        d = a[b].blocks;
        break;
      }
    }
    a = [];
    for (b = 0;b < d.length;b++) {
      var e = d[b], f = Entry.block[e];
      if (!this.checkBanClass(f)) {
        if (f && f.def) {
          if (f.defs) {
            for (b = 0;b < f.defs.length;b++) {
              a.push([f.defs[b]]);
            }
          } else {
            a.push([f.def]);
          }
        } else {
          a.push([{type:e}]);
        }
      }
    }
    this._categoryCodes.arduino = a;
  };
  a.setAlign = function(b) {
    this._align = b || "CENTER";
  };
})(Entry.BlockMenu.prototype);
Entry.BlockMenuScroller = function(a) {
  var b = this;
  this.board = a;
  this.board.changeEvent.attach(this, this._reset);
  this.svgGroup = null;
  this.vRatio = this.vY = this.vWidth = this.hX = 0;
  this._visible = !0;
  this._opacity = -1;
  this.mouseHandler = function() {
    b.onMouseDown.apply(b, arguments);
  };
  this.createScrollBar();
  this.setOpacity(0);
  this._addControl();
  this._domHeight = 0;
  Entry.windowResized && Entry.windowResized.attach(this, this.resizeScrollBar);
};
Entry.BlockMenuScroller.RADIUS = 7;
(function(a) {
  a.createScrollBar = function() {
    this.svgGroup = this.board.svgGroup.elem("g", {class:"boardScrollbar"});
    this.vScrollbar = this.svgGroup.elem("rect", {rx:4, ry:4});
    this.resizeScrollBar();
  };
  a.resizeScrollBar = function() {
    this._updateRatio();
    var b = this.board.blockMenuContainer, a = b.height();
    if (a !== this._domHeight) {
      return this._domHeight = a, this.board.align();
    }
    this._visible && 0 !== this.vRatio && this.vScrollbar.attr({width:9, height:b.height() / this.vRatio, x:b.width() - 9});
  };
  a.updateScrollBar = function(b) {
    this.vY += b;
    this.vScrollbar.attr({y:this.vY});
  };
  a.scroll = function(b) {
    this.isVisible() && (b = this._adjustValue(b) - this.vY, 0 !== b && (this.board.code.moveBy(0, -b * this.vRatio), this.updateScrollBar(b)));
  };
  a._adjustValue = function(b) {
    var a = this.board.svgDom.height(), a = a - a / this.vRatio;
    b = this.vY + b;
    b = Math.max(0, b);
    return b = Math.min(a, b);
  };
  a.setVisible = function(b) {
    b != this.isVisible() && (this._visible = b, this.svgGroup.attr({display:!0 === b ? "block" : "none"}));
  };
  a.setOpacity = function(b) {
    this._opacity != b && (this.vScrollbar.attr({opacity:b}), this._opacity = b);
  };
  a.isVisible = function() {
    return this._visible;
  };
  a._updateRatio = function() {
    var b = this.board, a = b.svgBlockGroup.getBoundingClientRect(), d = b.blockMenuContainer.height();
    b.offset();
    this.vRatio = b = (a.height + 20) / d;
    1 >= b ? this.setVisible(!1) : this.setVisible(!0);
  };
  a._reset = function() {
    this.vY = 0;
    this.vScrollbar.attr({y:this.vY});
    this.resizeScrollBar();
  };
  a.onMouseDown = function(b) {
    function a(b) {
      b.stopPropagation && b.stopPropagation();
      b.preventDefault && b.preventDefault();
      b = b.originalEvent && b.originalEvent.touches ? b.originalEvent.touches[0] : b;
      var a = e.dragInstance;
      e.scroll(b.pageY - a.offsetY);
      a.set({offsetY:b.pageY});
    }
    function d(b) {
      $(document).unbind(".scroll");
      delete e.dragInstance;
    }
    var e = this;
    b.stopPropagation && b.stopPropagation();
    b.preventDefault && b.preventDefault();
    if (0 === b.button || b.originalEvent && b.originalEvent.touches) {
      Entry.documentMousedown && Entry.documentMousedown.notify(b);
      var f;
      f = b.originalEvent && b.originalEvent.touches ? b.originalEvent.touches[0] : b;
      var g = $(document);
      g.bind("mousemove.scroll", a);
      g.bind("mouseup.scroll", d);
      g.bind("touchmove.scroll", a);
      g.bind("touchend.scroll", d);
      e.dragInstance = new Entry.DragInstance({startY:f.pageY, offsetY:f.pageY});
    }
    b.stopPropagation();
  };
  a._addControl = function() {
    $(this.vScrollbar).bind("mousedown touchstart", this.mouseHandler);
  };
})(Entry.BlockMenuScroller.prototype);
Entry.BlockView = function(a, b, c) {
  var d = this;
  Entry.Model(this, !1);
  this.block = a;
  this._lazyUpdatePos = _.debounce(a._updatePos.bind(a), 200);
  this._board = b;
  this._observers = [];
  this.set(a);
  this.svgGroup = b.svgBlockGroup.elem("g");
  this._schema = Entry.skinContainer.getSkin(a);
  if (void 0 === this._schema) {
    this.block.destroy(!1, !1);
  } else {
    this._schema.deletable && this.block.setDeletable(this._schema.deletable);
    this._schema.copyable && this.block.setCopyable(this._schema.copyable);
    !1 === this._schema.display && this.set({display:!1});
    this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this._updateSchema));
    var e = this._skeleton = Entry.skeleton[this._schema.skeleton];
    this._contents = [];
    this._statements = [];
    this._extensions = [];
    this.magnet = {};
    this._paramMap = {};
    e.magnets && e.magnets(this).next && (this.svgGroup.nextMagnet = this.block, this._nextGroup = this.svgGroup.elem("g", {class:"entryBlockNextGroup"}), this._observers.push(this.observe(this, "_updateMagnet", ["contentHeight"])));
    this.isInBlockMenu = this.getBoard() instanceof Entry.BlockMenu;
    this.mouseHandler = function() {
      var b = d.block.events;
      b && b.mousedown && b.mousedown.forEach(function(b) {
        b(d);
      });
      d.onMouseDown.apply(d, arguments);
    };
    this._startRender(a, c);
    this._observers.push(this.block.observe(this, "_setMovable", ["movable"]));
    this._observers.push(this.block.observe(this, "_setReadOnly", ["movable"]));
    this._observers.push(this.block.observe(this, "_setCopyable", ["copyable"]));
    this._observers.push(this.block.observe(this, "_updateColor", ["deletable"], !1));
    this._observers.push(this.observe(this, "_updateBG", ["magneting"], !1));
    this._observers.push(this.observe(this, "_updateOpacity", ["visible"], !1));
    this._observers.push(this.observe(this, "_updateDisplay", ["display"], !1));
    this._observers.push(this.observe(this, "_updateShadow", ["shadow"]));
    this._observers.push(this.observe(this, "_updateMagnet", ["offsetY"]));
    this._observers.push(b.code.observe(this, "_setBoard", ["board"], !1));
    this.dragMode = Entry.DRAG_MODE_NONE;
    Entry.Utils.disableContextmenu(this.svgGroup.node);
    b = a.events.viewAdd;
    "workspace" == Entry.type && b && !this.isInBlockMenu && b.forEach(function(b) {
      Entry.Utils.isFunction(b) && b(a);
    });
  }
};
Entry.BlockView.PARAM_SPACE = 5;
Entry.BlockView.DRAG_RADIUS = 5;
Entry.BlockView.pngMap = {};
(function(a) {
  a.schema = {id:0, type:Entry.STATIC.BLOCK_RENDER_MODEL, x:0, y:0, offsetX:0, offsetY:0, width:0, height:0, contentWidth:0, contentHeight:0, magneting:!1, visible:!0, animating:!1, shadow:!0, display:!0};
  a._startRender = function(b, a) {
    var c = this;
    b = this._skeleton;
    this.svgGroup.attr({class:"block"});
    this._schema.css && this.svgGroup.attr({style:this._schema.css});
    var e = b.classes;
    e && 0 !== e.length && e.forEach(function(b) {
      c.svgGroup.addClass(b);
    });
    e = b.path(this);
    this.pathGroup = this.svgGroup.elem("g");
    this._updateMagnet();
    this._path = this.pathGroup.elem("path");
    Entry.isMobile() || ($(this._path).mouseenter(function(b) {
      c._mouseEnable && c._changeFill(!0);
    }), $(this._path).mouseleave(function(b) {
      c._mouseEnable && c._changeFill(!1);
    }));
    var f = this._schema.color;
    this.block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN && (f = Entry.Utils.colorLighten(f));
    this._fillColor = f;
    e = {d:e, fill:f, class:"blockPath"};
    if (this.magnet.next || this._skeleton.nextShadow) {
      f = this.getBoard().suffix, this.pathGroup.attr({filter:"url(#entryBlockShadowFilter_" + f + ")"});
    } else {
      if (this.magnet.string || this.magnet.boolean) {
        e.stroke = b.outerLine;
      }
    }
    b.outerLine && (e["stroke-width"] = "0.6");
    this._path.attr(e);
    this._moveTo(this.x, this.y, !1);
    this._startContentRender(a);
    this._startExtension(a);
    !0 !== this._board.disableMouseEvent && this._addControl();
    (a = this.guideSvgGroup) && this.svgGroup.insertBefore(a, this.svgGroup.firstChild);
    this.bindPrev();
  };
  a._startContentRender = function(b) {
    b = void 0 === b ? Entry.Workspace.MODE_BOARD : b;
    var a = this._schema;
    this.contentSvgGroup && this.contentSvgGroup.remove();
    this.statementSvgGroup && this.statementSvgGroup.remove();
    this._contents = [];
    this.contentSvgGroup = this.svgGroup.elem("g", {class:"contentsGroup"});
    a.statements && a.statements.length && (this.statementSvgGroup = this.svgGroup.elem("g", {class:"statementGroup"}));
    switch(b) {
      case Entry.Workspace.MODE_BOARD:
      case Entry.Workspace.MODE_OVERLAYBOARD:
        for (var d = /(%\d)/mi, e = (a.template ? a.template : Lang.template[this.block.type]).split(d), f = a.params, g = 0;g < e.length;g++) {
          var h = e[g];
          " " === h[0] && (h = h.substring(1));
          " " === h[h.length - 1] && (h = h.substring(0, h.length - 1));
          if (0 !== h.length) {
            if (d.test(h)) {
              var k = Number(h.split("%")[1]) - 1, h = f[k], h = new Entry["Field" + h.type](h, this, k, b, g);
              this._contents.push(h);
              this._paramMap[k] = h;
            } else {
              this._contents.push(new Entry.FieldText({text:h}, this));
            }
          }
        }
        if ((b = a.statements) && b.length) {
          for (g = 0;g < b.length;g++) {
            this._statements.push(new Entry.FieldStatement(b[g], this, g));
          }
        }
        break;
      case Entry.Workspace.MODE_VIMBOARD:
        if ("basic_button" === this._schema.skeleton) {
          this._startContentRender(Entry.Workspace.MODE_BOARD);
          return;
        }
        a = this.getBoard().workspace.getCodeToText(this.block);
        b = !1;
        /(if)+(.|\n)+(else)+/.test(a) && (g = a.split("\n"), a = g.shift() + " " + g.shift(), b = !0, g = g.join(" "));
        a = {text:a, color:"white"};
        this.block._schema.vimModeFontColor && (a.color = this.block._schema.vimModeFontColor);
        this._contents.push(new Entry.FieldText(a, this));
        b && (this._contents.push(new Entry.FieldLineBreak(null, this)), a.text = g, this._contents.push(new Entry.FieldText(a, this)));
    }
    this.alignContent(!1);
  };
  a._startExtension = function(b) {
    this._extensions = this.block.extensions.map(function(a) {
      return new Entry["Ext" + a.type](a, this, b);
    }.bind(this));
  };
  a._updateSchema = function() {
    this._startContentRender();
  };
  a.changeType = function(b) {
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
    this._schema = Entry.block[b];
    this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this._updateSchema));
    this._updateSchema();
  };
  a.alignContent = function(b) {
    !0 !== b && (b = !1);
    for (var a = 0, d = 0, e = 0, f = 0, g = 0, h = 0, k = 0;k < this._contents.length;k++) {
      var m = this._contents[k];
      m instanceof Entry.FieldLineBreak ? (this._alignStatement(b, f), m.align(f), f++, d = m.box.y, a = 8) : (m.align(a, d, b), k === this._contents.length - 1 || m instanceof Entry.FieldText && 0 == m._text.length || (a += Entry.BlockView.PARAM_SPACE));
      m = m.box;
      0 !== f ? h = Math.max(1E6 * Math.round(m.height), h) : e = Math.max(m.height, e);
      a += m.width;
      g = Math.max(g, a);
      this.set({contentWidth:g, contentHeight:e});
    }
    this.set({contentHeight:e + h});
    this._statements.length != f && this._alignStatement(b, f);
    b = this.getContentPos();
    this.contentSvgGroup.attr("transform", "translate(" + b.x + "," + b.y + ")");
    this.contentPos = b;
    this._render();
    this._updateMagnet();
  };
  a._alignStatement = function(b, a) {
    var c = this._skeleton.statementPos ? this._skeleton.statementPos(this) : [], e = this._statements[a];
    e && (a = c[a]) && e.align(a.x, a.y, b);
  };
  a._render = function() {
    this._renderPath();
    this.set(this._skeleton.box(this));
  };
  a._renderPath = function() {
    var b = this._skeleton.path(this);
    this._path.attr({d:b});
    this.set({animating:!1});
    this._setBackgroundPath();
  };
  a._setPosition = function(b) {
    this.svgGroup.attr("transform", "translate(" + this.x + "," + this.y + ")");
  };
  a._toLocalCoordinate = function(b) {
    this._moveTo(0, 0, !1);
    b.appendChild(this.svgGroup);
  };
  a._toGlobalCoordinate = function(b) {
    b = this.getAbsoluteCoordinate(b);
    this._moveTo(b.x, b.y, !1);
    this.getBoard().svgBlockGroup.appendChild(this.svgGroup);
  };
  a._moveTo = function(b, a, d) {
    this.display ? this.set({x:b, y:a}) : this.set({x:-99999, y:-99999});
    this._lazyUpdatePos();
    this.visible && this.display && this._setPosition(d);
  };
  a._moveBy = function(b, a, d) {
    return this._moveTo(this.x + b, this.y + a, d);
  };
  a._addControl = function() {
    var b = this;
    this._mouseEnable = !0;
    $(this.svgGroup).bind("mousedown.blockViewMousedown touchstart.blockViewMousedown", b.mouseHandler);
    var a = b.block.events;
    a && a.dblclick && $(this.svgGroup).dblclick(function() {
      a.dblclick.forEach(function(a) {
        a && a(b);
      });
    });
  };
  a.removeControl = function() {
    this._mouseEnable = !1;
    $(this.svgGroup).unbind(".blockViewMousedown");
  };
  a.onMouseDown = function(b) {
    function c(b) {
      b.stopPropagation();
      var c = g.workspace.getMode(), d;
      c === Entry.Workspace.MODE_VIMBOARD && a.vimBoardEvent(b, "dragOver");
      d = b.originalEvent && b.originalEvent.touches ? b.originalEvent.touches[0] : b;
      var h = f.mouseDownCoordinate, h = Math.sqrt(Math.pow(d.pageX - h.x, 2) + Math.pow(d.pageY - h.y, 2));
      if (f.dragMode == Entry.DRAG_MODE_DRAG || h > Entry.BlockView.DRAG_RADIUS) {
        e && (clearTimeout(e), e = null), f.movable && (f.isInBlockMenu ? g.cloneToGlobal(b) : (b = !1, f.dragMode != Entry.DRAG_MODE_DRAG && (f._toGlobalCoordinate(), f.dragMode = Entry.DRAG_MODE_DRAG, f.block.getThread().changeEvent.notify(), Entry.GlobalSvg.setView(f, c), b = !0), this.animating && this.set({animating:!1}), 0 === f.dragInstance.height && f.dragInstance.set({height:-1 + f.height}), c = f.dragInstance, f._moveBy(d.pageX - c.offsetX, d.pageY - c.offsetY, !1), c.set({offsetX:d.pageX, 
        offsetY:d.pageY}), Entry.GlobalSvg.position(), f.originPos || (f.originPos = {x:f.x, y:f.y}), b && g.generateCodeMagnetMap(), f._updateCloseBlock()));
      }
    }
    function d(b) {
      e && (clearTimeout(e), e = null);
      $(document).unbind(".block");
      f.terminateDrag(b);
      g && g.set({dragBlock:null});
      f._changeFill(!1);
      Entry.GlobalSvg.remove();
      delete this.mouseDownCoordinate;
      delete f.dragInstance;
    }
    b.stopPropagation && b.stopPropagation();
    b.preventDefault && b.preventDefault();
    var e = null, f = this;
    this._changeFill(!1);
    var g = this.getBoard();
    Entry.documentMousedown && Entry.documentMousedown.notify(b);
    if (!this.readOnly && !g.viewOnly) {
      g.setSelectedBlock(this);
      this.dominate();
      if (0 === b.button || b.originalEvent && b.originalEvent.touches) {
        var h = b.type, k;
        k = b.originalEvent && b.originalEvent.touches ? b.originalEvent.touches[0] : b;
        this.mouseDownCoordinate = {x:k.pageX, y:k.pageY};
        var m = $(document);
        m.bind("mousemove.block touchmove.block", c);
        m.bind("mouseup.block touchend.block", d);
        this.dragInstance = new Entry.DragInstance({startX:k.pageX, startY:k.pageY, offsetX:k.pageX, offsetY:k.pageY, height:0, mode:!0});
        g.set({dragBlock:this});
        this.addDragging();
        this.dragMode = Entry.DRAG_MODE_MOUSEDOWN;
        "touchstart" === h && (e = setTimeout(function() {
          e && (e = null, d(), f._rightClick(b));
        }, 1E3));
      } else {
        Entry.Utils.isRightButton(b) && this._rightClick(b);
      }
      g.workspace.getMode() === Entry.Workspace.MODE_VIMBOARD && b && (vimBoard = $(".entryVimBoard>.CodeMirror")[0], document.getElementsByClassName("CodeMirror")[0].dispatchEvent(Entry.Utils.createMouseEvent("dragStart", event)));
    }
  };
  a.vimBoardEvent = function(b, a, d) {
    b && (b = Entry.Utils.createMouseEvent(a, b), d && (b.block = d), document.getElementsByClassName("CodeMirror")[0].dispatchEvent(b));
  };
  a.terminateDrag = function(b) {
    var a = this.getBoard(), d = this.dragMode, e = this.block, f = a.workspace.getMode();
    this.removeDragging();
    this.set({visible:!0});
    this.dragMode = Entry.DRAG_MODE_NONE;
    if (f === Entry.Workspace.MODE_VIMBOARD) {
      a instanceof Entry.BlockMenu ? (a.terminateDrag(), this.vimBoardEvent(b, "dragEnd", e)) : a.clear();
    } else {
      if (d === Entry.DRAG_MODE_DRAG) {
        var f = this.dragInstance && this.dragInstance.isNew, g = Entry.GlobalSvg;
        b = !1;
        var h = this.block.getPrevBlock(this.block);
        switch(g.terminateDrag(this)) {
          case g.DONE:
            g = a.magnetedBlockView;
            g instanceof Entry.BlockView && (g = g.block);
            h && !g ? Entry.do("separateBlock", e) : h || g || f ? g ? ("next" === g.view.magneting ? (h = e.getLastBlock(), this.dragMode = d, a.separate(e), this.dragMode = Entry.DRAG_MODE_NONE, Entry.do("insertBlock", g, h).isPass(f), Entry.ConnectionRipple.setView(g.view).dispose()) : (Entry.do("insertBlock", e, g).isPass(f), b = !0), createjs.Sound.play("entryMagneting")) : Entry.do("moveBlock", e).isPass(f) : e.getThread().view.isGlobal() ? Entry.do("moveBlock", e) : Entry.do("separateBlock", 
            e);
            break;
          case g.RETURN:
            e = this.block;
            d = this.originPos;
            h ? (this.set({animating:!1}), createjs.Sound.play("entryMagneting"), this.bindPrev(h), e.insert(h)) : (f = e.getThread().view.getParent(), f instanceof Entry.Board ? this._moveTo(d.x, d.y, !1) : (createjs.Sound.play("entryMagneting"), Entry.do("insertBlock", e, f)));
            break;
          case g.REMOVE:
            createjs.Sound.play("entryDelete"), f ? this.block.destroy(!1, !0) : this.block.doDestroyBelow(!1);
        }
        a.setMagnetedBlock(null);
        b && Entry.ConnectionRipple.setView(e.view).dispose();
      }
    }
    this.destroyShadow();
    delete this.originPos;
    this.dominate();
  };
  a._updateCloseBlock = function() {
    var b = this.getBoard(), a;
    if (this._skeleton.magnets) {
      for (var d in this.magnet) {
        if (a = "next" === d ? this.getBoard().getNearestMagnet(this.x, this.y + this.getBelowHeight(), d) : this.getBoard().getNearestMagnet(this.x, this.y, d)) {
          return b.setMagnetedBlock(a.view, d);
        }
      }
      b.setMagnetedBlock(null);
    }
  };
  a.dominate = function() {
    this.block.getThread().view.dominate();
  };
  a.getSvgRoot = function() {
    for (var b = this.getBoard().svgBlockGroup, a = this.svgGroup;a.parentNode !== b;) {
      a = a.parentNode;
    }
    return a;
  };
  a.getBoard = function() {
    return this._board;
  };
  a._setBoard = function() {
    this._board = this._board.code.board;
  };
  a.destroy = function(b) {
    $(this.svgGroup).unbind(".blockViewMousedown");
    this._destroyObservers();
    var a = this.svgGroup;
    b ? $(a).fadeOut(100, function() {
      a.remove();
    }) : a.remove();
    this._contents.forEach(function(b) {
      b.constructor !== Entry.Block && b.destroy();
    });
    this._statements.forEach(function(b) {
      b.destroy();
    });
    var d = this.block;
    b = d.events.viewDestroy;
    "workspace" == Entry.type && b && !this.isInBlockMenu && b.forEach(function(b) {
      Entry.Utils.isFunction(b) && b(d);
    });
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
  };
  a.getShadow = function() {
    this._shadow || (this._shadow = Entry.SVG.createElement(this.svgGroup.cloneNode(!0), {opacity:.5}), this.getBoard().svgGroup.appendChild(this._shadow));
    return this._shadow;
  };
  a.destroyShadow = function() {
    this._shadow && (this._shadow.remove(), delete this._shadow);
  };
  a._updateMagnet = function() {
    if (this._skeleton.magnets) {
      var b = this._skeleton.magnets(this);
      b.next && this._nextGroup.attr("transform", "translate(" + b.next.x + "," + b.next.y + ")");
      this.magnet = b;
      this.block.getThread().changeEvent.notify();
    }
  };
  a._updateBG = function() {
    if (this._board.dragBlock && this._board.dragBlock.dragInstance) {
      var b = this.svgGroup;
      if (this.magnet.next || this.magnet.previous) {
        if (b = this.magneting) {
          var a = this._board.dragBlock.getShadow(), d = this.getAbsoluteCoordinate(), e;
          if ("previous" === b) {
            e = this.magnet.next, e = "translate(" + (d.x + e.x) + "," + (d.y + e.y) + ")";
          } else {
            if ("next" === b) {
              e = this.magnet.previous;
              var f = this._board.dragBlock.getBelowHeight();
              e = "translate(" + (d.x + e.x) + "," + (d.y + e.y - f) + ")";
            }
          }
          $(a).attr({transform:e, display:"block"});
          this._clonedShadow = a;
          this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground);
          "previous" === b && (b = this._board.dragBlock.getBelowHeight() + this.offsetY, this.originalHeight = this.offsetY, this.set({offsetY:b}));
        } else {
          this._clonedShadow && (this._clonedShadow.attr({display:"none"}), delete this._clonedShadow), b = this.originalHeight, void 0 !== b && (this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground), this.set({offsetY:b}), delete this.originalHeight);
        }
        (b = this.block.thread.changeEvent) && b.notify();
      } else {
        this.magneting ? (b.attr({filter:"url(#entryBlockHighlightFilter_" + this.getBoard().suffix + ")"}), b.addClass("outputHighlight")) : (b.removeClass("outputHighlight"), b.removeAttr("filter"));
      }
    }
  };
  a.addDragging = function() {
    this.svgGroup.addClass("dragging");
  };
  a.removeDragging = function() {
    this.svgGroup.removeClass("dragging");
  };
  a.addSelected = function() {
    this.svgGroup.addClass("selected");
  };
  a.removeSelected = function() {
    this.svgGroup.removeClass("selected");
  };
  a.getSkeleton = function() {
    return this._skeleton;
  };
  a.getContentPos = function() {
    return this._skeleton.contentPos(this);
  };
  a.renderText = function() {
    this._startContentRender(Entry.Workspace.MODE_VIMBOARD);
  };
  a.renderBlock = function() {
    this._startContentRender(Entry.Workspace.MODE_BOARD);
  };
  a._updateOpacity = function() {
    this.svgGroup.attr({opacity:!1 === this.visible ? 0 : 1});
    this.visible && this._setPosition();
  };
  a._updateShadow = function() {
    this.shadow && Entry.Utils.colorDarken(this._schema.color, .7);
  };
  a._setMovable = function() {
    this.movable = null !== this.block.isMovable() ? this.block.isMovable() : void 0 !== this._skeleton.movable ? this._skeleton.movable : !0;
  };
  a._setReadOnly = function() {
    this.readOnly = null !== this.block.isReadOnly() ? this.block.isReadOnly() : void 0 !== this._skeleton.readOnly ? this._skeleton.readOnly : !1;
  };
  a._setCopyable = function() {
    this.copyable = null !== this.block.isCopyable() ? this.block.isCopyable() : void 0 !== this._skeleton.copyable ? this._skeleton.copyable : !0;
  };
  a.bumpAway = function(b, a) {
    var c = this;
    b = b || 15;
    a ? window.setTimeout(function() {
      c._moveBy(b, b, !1);
    }, a) : c._moveBy(b, b, !1);
  };
  a.bindPrev = function(b, a) {
    if (b) {
      this._toLocalCoordinate(b.view._nextGroup);
      var c = b.getNextBlock();
      if (c && c && c !== this.block) {
        var e = this.block.getLastBlock();
        a ? c.view._toLocalCoordinate(b.view._nextGroup) : e.view.magnet.next ? c.view._toLocalCoordinate(e.view._nextGroup) : (c.view._toGlobalCoordinate(), c.separate(), c.view.bumpAway(null, 100));
      }
    } else {
      if (b = this.block.getPrevBlock()) {
        this._toLocalCoordinate(b.view._nextGroup), (c = this.block.getNextBlock()) && c.view && c.view._toLocalCoordinate(this._nextGroup);
      }
    }
  };
  a.getAbsoluteCoordinate = function(b) {
    b = void 0 !== b ? b : this.dragMode;
    if (b === Entry.DRAG_MODE_DRAG) {
      return {x:this.x, y:this.y};
    }
    b = this.block.getThread().view.requestAbsoluteCoordinate(this);
    b.x += this.x;
    b.y += this.y;
    return b;
  };
  a.getBelowHeight = function() {
    return this.block.getThread().view.requestPartHeight(this);
  };
  a._updateDisplay = function() {
    this.svgGroup.attr({display:!1 === this.display ? "none" : "block"});
    this.display && this._setPosition();
  };
  a._updateColor = function() {
    var b = this._schema.color;
    this.block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN && (b = Entry.Utils.colorLighten(b));
    this._fillColor = b;
    this._path.attr({fill:b});
    this._updateContents();
  };
  a._updateContents = function() {
    this._contents.forEach(function(b) {
      b.renderStart();
    }.bind(this));
    this.alignContent(!1);
  };
  a._destroyObservers = function() {
    for (var b = this._observers;b.length;) {
      b.pop().destroy();
    }
  };
  a._changeFill = function(b) {
    var a = this.getBoard();
    if (!a.dragBlock) {
      var d = this._fillColor, e = this._path, a = this.getBoard();
      b ? (d = "url(#blockHoverPattern_" + this.getBoard().suffix + ")", a.enablePattern()) : a.disablePattern();
      e.attr({fill:d});
    }
  };
  a.addActivated = function() {
    this.svgGroup.addClass("activated");
  };
  a.removeActivated = function() {
    this.svgGroup.removeClass("activated");
  };
  a.reDraw = function() {
    if (this.visible && this.display) {
      var b = this.block;
      this._updateContents();
      var a = b.statements;
      if (a) {
        for (b = 0;b < a.length;b++) {
          a[b].view.reDraw();
        }
      }
      if (a = this._extensions) {
        for (b = 0;b < a.length;b++) {
          var d = a[b];
          d.updatePos && d.updatePos();
        }
      }
    }
  };
  a.getParam = function(b) {
    return this._paramMap[b];
  };
  a.getDataUrl = function(b, a) {
    function c() {
      g = g.replace("(svgGroup)", (new XMLSerializer).serializeToString(k)).replace("%W", h.width * m).replace("%H", h.height * m).replace("(defs)", (new XMLSerializer).serializeToString(n[0])).replace(/>\s+/g, ">").replace(/\s+</g, "<");
      var b = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(g)));
      g = null;
      a ? (f.resolve({src:b, width:h.width, height:h.height}), k = null) : e(b, h.width, h.height, 1.5).then(function(b) {
        k = null;
        f.resolve({src:b, width:h.width, height:h.height});
      }, function(b) {
        f.reject("error occured");
      });
      b = null;
    }
    function e(b, a, c, d) {
      var e = $.Deferred();
      d || (d = 1);
      void 0 !== Entry.BlockView.pngMap[b] && e.resolve(Entry.BlockView.pngMap[b]);
      a *= d;
      c *= d;
      a = Math.ceil(a);
      c = Math.ceil(c);
      var f = document.createElement("img");
      f.crossOrigin = "Anonymous";
      var g = document.createElement("canvas");
      g.width = a;
      g.height = c;
      var h = g.getContext("2d");
      f.onload = function() {
        h.drawImage(f, 0, 0, a, c);
        var d = g.toDataURL("image/png");
        /\.png$/.test(b) && (Entry.BlockView.pngMap[b] = d);
        e.resolve(d);
      };
      f.onerror = function() {
        e.reject("error occured");
      };
      f.src = b;
      return e.promise();
    }
    var f = $.Deferred(), g = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %W %H">(svgGroup)(defs)</svg>', h = this.svgGroup.getBoundingClientRect(), k = b ? this.svgGroup : this.svgGroup.cloneNode(!0);
    b = this._skeleton.box(this);
    var m = a ? 1 : 1.5, l = function() {
      var b = window.platform;
      return b && "windows" === b.name.toLowerCase() && "7" === b.version[0] ? !0 : !1;
    }() ? .9 : .95;
    -1 < this.type.indexOf("func_") && (l *= .99);
    k.setAttribute("transform", "scale(%SCALE) translate(%X,%Y)".replace("%X", -b.offsetX).replace("%Y", -b.offsetY).replace("%SCALE", m));
    var n = this.getBoard().svgDom.find("defs"), q = k.getElementsByTagName("image");
    b = k.getElementsByTagName("text");
    for (var r = ["\u2265", "\u2264"], t = "\u2265\u2264-><=+-x/".split(""), u = 0;u < b.length;u++) {
      (function(b) {
        b.setAttribute("font-family", "'nanumBarunRegular', 'NanumGothic', '\ub098\ub214\uace0\ub515','NanumGothicWeb', '\ub9d1\uc740 \uace0\ub515', 'Malgun Gothic', Dotum");
        var a = parseInt(b.getAttribute("font-size")), c = $(b).text();
        -1 < r.indexOf(c) && b.setAttribute("font-weight", "500");
        if ("q" == c) {
          var d = parseInt(b.getAttribute("y"));
          b.setAttribute("y", d - 1);
        }
        -1 < t.indexOf(c) ? b.setAttribute("font-size", a + "px") : b.setAttribute("font-size", a * l + "px");
        b.setAttribute("alignment-baseline", "baseline");
      })(b[u]);
    }
    var v = 0;
    if (0 === q.length) {
      c();
    } else {
      for (u = 0;u < q.length;u++) {
        (function(b) {
          var a = b.getAttribute("href");
          e(a, b.getAttribute("width"), b.getAttribute("height")).then(function(a) {
            b.setAttribute("href", a);
            if (++v == q.length) {
              return c();
            }
          });
        })(q[u]);
      }
    }
    return f.promise();
  };
  a.downloadAsImage = function(b) {
    this.getDataUrl().then(function(a) {
      var c = document.createElement("a");
      c.href = a.src;
      a = "\uc5d4\ud2b8\ub9ac \ube14\ub85d";
      b && (a += b);
      c.download = a + ".png";
      c.click();
    });
  };
  a._rightClick = function(b) {
    var a = Entry.disposeEvent;
    a && a.notify(b);
    var d = this, e = d.block;
    if (!this.isInBlockMenu) {
      var a = [], f = {text:Lang.Blocks.Duplication_option, enable:this.copyable, callback:function() {
        Entry.do("cloneBlock", e);
      }}, g = {text:Lang.Blocks.CONTEXT_COPY_option, enable:this.copyable, callback:function() {
        d.block.copyToClipboard();
      }}, h = {text:Lang.Blocks.Delete_Blocks, enable:e.isDeletable(), callback:function() {
        Entry.do("destroyBlock", d.block);
      }}, k = {text:Lang.Menus.save_as_image, callback:function() {
        d.downloadAsImage();
      }};
      a.push(f);
      a.push(g);
      a.push(h);
      Entry.Utils.isChrome() && "workspace" == Entry.type && !Entry.isMobile() && a.push(k);
      b.originalEvent && b.originalEvent.touches && (b = b.originalEvent.touches[0]);
      Entry.ContextMenu.show(a, null, {x:b.clientX, y:b.clientY});
    }
  };
  a.clone = function() {
    return this.svgGroup.cloneNode(!0);
  };
  a._setBackgroundPath = function() {
    this._backgroundPath && $(this._backgroundPath).remove();
    var b = this._path.cloneNode(!0);
    b.setAttribute("class", "blockBackgroundPath");
    b.setAttribute("fill", this._fillColor);
    this._backgroundPath = b;
    this.pathGroup.insertBefore(b, this._path);
  };
})(Entry.BlockView.prototype);
Entry.Field = function() {
};
(function(a) {
  a.TEXT_LIMIT_LENGTH = 20;
  a.destroy = function() {
    $(this.svgGroup).unbind("mouseup touchend");
    this.destroyOption();
  };
  a.command = function() {
    this._startValue && (this._startValue === this.getValue() || this._blockView.isInBlockMenu || Entry.do("setFieldValue", this._block, this, this.pointer(), this._startValue, this.getValue()));
    delete this._startValue;
  };
  a.destroyOption = function() {
    this.documentDownEvent && (Entry.documentMousedown.detach(this.documentDownEvent), delete this.documentDownEvent);
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.documentDownEvent);
    if (this.optionGroup) {
      var b = this.optionGroup.blur;
      b && Entry.Utils.isFunction(b) && this.optionGroup.blur();
      this.optionGroup.remove();
      delete this.optionGroup;
    }
    this.command();
  };
  a._attachDisposeEvent = function(b) {
    var a = this;
    a.disposeEvent = Entry.disposeEvent.attach(a, b || function() {
      a.destroyOption();
    });
  };
  a.align = function(b, a, d) {
    var c = this.svgGroup;
    this._position && (this._position.x && (b = this._position.x), this._position.y && (a = this._position.y));
    var f = "translate(" + b + "," + a + ")";
    void 0 === d || d ? c.animate({transform:f}, 300, mina.easeinout) : c.attr({transform:f});
    this.box.set({x:b, y:a});
  };
  a.getAbsolutePosFromBoard = function() {
    var b = this._block.view, a = b.getContentPos(), b = b.getAbsoluteCoordinate();
    return {x:b.x + this.box.x + a.x, y:b.y + this.box.y + a.y};
  };
  a.getAbsolutePosFromDocument = function() {
    var b = this._block.view, a = b.getContentPos(), d = b.getAbsoluteCoordinate(), b = b.getBoard().svgDom.offset();
    return {x:d.x + this.box.x + a.x + b.left, y:d.y + this.box.y + a.y + b.top};
  };
  a.getRelativePos = function() {
    var b = this._block.view.getContentPos(), a = this.box;
    return {x:a.x + b.x, y:a.y + b.y};
  };
  a.truncate = function() {
    var b = String(this.getValue()), a = this.TEXT_LIMIT_LENGTH, d = b.substring(0, a);
    b.length > a && (d += "...");
    return d;
  };
  a.appendSvgOptionGroup = function() {
    return this._block.view.getBoard().svgGroup.elem("g");
  };
  a.getValue = function() {
    var b = this._block.params[this._index];
    if (this._contents && this._contents.reference && this._contents.reference.length) {
      var a = this._contents.reference.concat();
      "%" === a[0][0] && (b = this._block.params[parseInt(a.shift().substr(1)) - 1]);
      return b ? b.getDataByPointer(a) : b;
    }
    return b;
  };
  a.setValue = function(b, a) {
    if (this.value != b) {
      this.value = b;
      if (this._contents && this._contents.reference && this._contents.reference.length) {
        var c = this._contents.reference.concat(), e = c.pop(), f = this._block.params[this._index];
        c.length && "%" === c[0][0] && (f = this._block.params[parseInt(c.shift().substr(1)) - 1]);
        c.length && (f = f.getDataByPointer(c));
        f.params[e] = b;
      } else {
        this._block.params[this._index] = b;
      }
      a && this._blockView.reDraw();
    }
  };
  a._isEditable = function() {
    if (Entry.ContextMenu.visible || this._block.view.dragMode == Entry.DRAG_MODE_DRAG) {
      return !1;
    }
    var b = this._block.view, a = b.getBoard();
    if (!0 === a.disableMouseEvent) {
      return !1;
    }
    var d = a.workspace.selectedBlockView;
    if (!d || a != d.getBoard()) {
      return !1;
    }
    a = b.getSvgRoot();
    return a == d.svgGroup || $(a).has($(b.svgGroup));
  };
  a._selectBlockView = function() {
    var b = this._block.view;
    b.getBoard().setSelectedBlock(b);
  };
  a._bindRenderOptions = function() {
    var b = this;
    $(this.svgGroup).bind("mouseup touchend", function(a) {
      b._isEditable() && (b.destroyOption(), b._startValue = b.getValue(), b.renderOptions());
    });
  };
  a.pointer = function(b) {
    b = b || [];
    b.unshift(this._index);
    b.unshift(Entry.PARAM);
    return this._block.pointer(b);
  };
  a.getFontSize = function(b) {
    return b = b || this._blockView.getSkeleton().fontSize || 12;
  };
  a.getContentHeight = function() {
    return Entry.isMobile() ? 22 : 16;
  };
})(Entry.Field.prototype);
Entry.FieldBlock = function(a, b, c, d, e) {
  Entry.Model(this, !1);
  this._blockView = b;
  this._block = b.block;
  this._valueBlock = null;
  this.box = new Entry.BoxModel;
  this.changeEvent = new Entry.Event(this);
  this._index = c;
  this.contentIndex = e;
  this._content = a;
  this.acceptType = a.accept;
  this._restoreCurrent = a.restore;
  this.view = this;
  this.svgGroup = null;
  this._position = a.position;
  this.box.observe(b, "alignContent", ["width", "height"]);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(b.getBoard(), d);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldBlock);
(function(a) {
  a.schema = {magneting:!1};
  a.renderStart = function(b, a) {
    this.svgGroup || (this.svgGroup = this._blockView.contentSvgGroup.elem("g"));
    this.view = this;
    this._nextGroup = this.svgGroup;
    this.box.set({x:0, y:0, width:0, height:20});
    var c = this.getValue();
    c && !c.view ? (c.setThread(this), c.createView(b, a), c.getThread().view.setParent(this)) : c && c.view && c.view.reDraw();
    this.updateValueBlock(c);
    this._blockView.getBoard().constructor !== Entry.Board && this._valueBlock.view.removeControl();
  };
  a.align = function(b, a, d) {
    var c = this.svgGroup;
    this._position && (this._position.x && (b = this._position.x), this._position.y && (a = this._position.y));
    var f = this._valueBlock;
    f && f && f.view && (a = -.5 * f.view.height);
    f = "translate(" + b + "," + a + ")";
    void 0 === d || d ? c.animate({transform:f}, 300, mina.easeinout) : c.attr({transform:f});
    this.box.set({x:b, y:a});
  };
  a.calcWH = function() {
    var b = this._valueBlock;
    b && b && b.view ? (b = b.view, this.box.set({width:b.width, height:b.height})) : this.box.set({width:15, height:20});
  };
  a.calcHeight = a.calcWH;
  a.destroy = function() {
  };
  a.inspectBlock = function() {
    var b = null;
    if (this._originBlock) {
      b = this._originBlock.type, delete this._originBlock;
    } else {
      switch(this.acceptType) {
        case "boolean":
          b = "True";
          break;
        case "string":
          b = "text";
          break;
        case "param":
          b = "function_field_label";
      }
    }
    return this._createBlockByType(b);
  };
  a._setValueBlock = function(b) {
    this._restoreCurrent && (this._originBlock = this._valueBlock);
    b || (b = this.inspectBlock());
    this._valueBlock = b;
    this.setValue(b);
    b.setThread(this);
    b.getThread().view.setParent(this);
    return this._valueBlock;
  };
  a.getValueBlock = function() {
    return this._valueBlock;
  };
  a.updateValueBlock = function(b) {
    b instanceof Entry.Block || (b = void 0);
    b && b === this._valueBlock ? this.calcWH() : (this._destroyObservers(), b = this._setValueBlock(b).view, b.bindPrev(this), this._blockView.alignContent(), this._posObserver = b.observe(this, "updateValueBlock", ["x", "y"], !1), this._sizeObserver = b.observe(this, "calcWH", ["width", "height"]), b = this._blockView.getBoard(), b.constructor === Entry.Board && b.generateCodeMagnetMap());
  };
  a._destroyObservers = function() {
    this._sizeObserver && this._sizeObserver.destroy();
    this._posObserver && this._posObserver.destroy();
  };
  a.getPrevBlock = function(b) {
    return this._valueBlock === b ? this : null;
  };
  a.getNextBlock = function() {
    return null;
  };
  a.requestAbsoluteCoordinate = function(b) {
    b = this._blockView;
    var a = b.contentPos;
    b = b.getAbsoluteCoordinate();
    b.x += this.box.x + a.x;
    b.y += this.box.y + a.y;
    return b;
  };
  a.dominate = function() {
    this._blockView.dominate();
  };
  a.isGlobal = function() {
    return !1;
  };
  a.separate = function(b) {
    this.getCode().createThread([b]);
    this.calcWH();
    this.changeEvent.notify();
  };
  a.getCode = function() {
    return this._block.thread.getCode();
  };
  a.cut = function(b) {
    return this._valueBlock === b ? [b] : null;
  };
  a.replace = function(b) {
    "string" === typeof b && (b = this._createBlockByType(b));
    var a = this._valueBlock;
    Entry.block[a.type].isPrimitive ? (a.doNotSplice = !0, a.destroy()) : "param" === this.acceptType ? (this._destroyObservers(), a.view._toGlobalCoordinate(), b.getTerminateOutputBlock().view._contents[1].replace(a)) : (this._destroyObservers(), a.view._toGlobalCoordinate(), this.separate(a), a.view.bumpAway(30, 150));
    this.updateValueBlock(b);
    b.view._toLocalCoordinate(this.svgGroup);
    this.calcWH();
    this.changeEvent.notify();
  };
  a.setParent = function(b) {
    this._parent = b;
  };
  a.getParent = function() {
    return this._parent;
  };
  a._createBlockByType = function(b) {
    this._block.getThread();
    var a = this._blockView.getBoard();
    b = new Entry.Block({type:b}, this);
    var d = a.workspace, e;
    d && (e = d.getMode());
    b.createView(a, e);
    return b;
  };
  a.spliceBlock = function() {
    this.updateValueBlock();
  };
  a._updateBG = function() {
    this.magneting ? this._bg = this.svgGroup.elem("path", {d:"m 8,12 l -4,0 -2,-2 0,-3 3,0 1,-1 0,-12 -1,-1 -3,0 0,-3 2,-2 l 4,0 z", fill:"#fff", stroke:"#fff", "fill-opacity":.7, transform:"translate(0,12)"}) : this._bg && (this._bg.remove(), delete this._bg);
  };
  a.getThread = function() {
    return this;
  };
  a.pointer = function(b) {
    b.unshift(this._index);
    b.unshift(Entry.PARAM);
    return this._block.pointer(b);
  };
})(Entry.FieldBlock.prototype);
Entry.Scroller = function(a, b, c) {
  this._horizontal = void 0 === b ? !0 : b;
  this._vertical = void 0 === c ? !0 : c;
  this.board = a;
  this.svgGroup = null;
  this.vRatio = this.vY = this.vWidth = this.hRatio = this.hX = this.hWidth = 0;
  this._visible = !0;
  this._opacity = -1;
  this.createScrollBar();
  this.setOpacity(0);
  this._bindEvent();
  this._scrollCommand = _.debounce(Entry.do, 200);
};
Entry.Scroller.RADIUS = 7;
(function(a) {
  a.createScrollBar = function() {
    var b = Entry.Scroller.RADIUS, a = this;
    this.svgGroup = this.board.svg.elem("g").attr({class:"boardScrollbar"});
    this._horizontal && (this.hScrollbar = this.svgGroup.elem("rect", {height:2 * b, rx:b, ry:b}), this.hScrollbar.mousedown = function(b) {
      function c(b) {
        b.stopPropagation();
        b.preventDefault();
        b.originalEvent.touches && (b = b.originalEvent.touches[0]);
        var c = a.dragInstance;
        a.scroll((b.pageX - c.offsetX) / a.hRatio, 0);
        c.set({offsetX:b.pageX, offsetY:b.pageY});
      }
      function d(b) {
        $(document).unbind(".scroll");
        delete a.dragInstance;
      }
      if (0 === b.button || b instanceof Touch) {
        Entry.documentMousedown && Entry.documentMousedown.notify(b);
        var g = $(document);
        g.bind("mousemove.scroll", c);
        g.bind("mouseup.scroll", d);
        g.bind("touchmove.scroll", c);
        g.bind("touchend.scroll", d);
        a.dragInstance = new Entry.DragInstance({startX:b.pageX, startY:b.pageY, offsetX:b.pageX, offsetY:b.pageY});
      }
      b.stopPropagation();
    });
    this._vertical && (this.vScrollbar = this.svgGroup.elem("rect", {width:2 * b, rx:b, ry:b}), this.vScrollbar.mousedown = function(b) {
      function c(b) {
        b.stopPropagation();
        b.preventDefault();
        b.originalEvent.touches && (b = b.originalEvent.touches[0]);
        var c = a.dragInstance;
        a.scroll(0, (b.pageY - c.offsetY) / a.vRatio);
        c.set({offsetX:b.pageX, offsetY:b.pageY});
      }
      function d(b) {
        $(document).unbind(".scroll");
        delete a.dragInstance;
      }
      if (0 === b.button || b instanceof Touch) {
        Entry.documentMousedown && Entry.documentMousedown.notify(b);
        var g = $(document);
        g.bind("mousemove.scroll", c);
        g.bind("mouseup.scroll", d);
        g.bind("touchmove.scroll", c);
        g.bind("touchend.scroll", d);
        a.dragInstance = new Entry.DragInstance({startX:b.pageX, startY:b.pageY, offsetX:b.pageX, offsetY:b.pageY});
      }
      b.stopPropagation();
    });
  };
  a.updateScrollBar = function(b, a) {
    this._horizontal && (this.hX += b * this.hRatio, this.hScrollbar.attr({x:this.hX}));
    this._vertical && (this.vY += a * this.vRatio, this.vScrollbar.attr({y:this.vY}));
  };
  a.scroll = function(b, a) {
    if (this.board.code) {
      var c = this.board.svgBlockGroup.getBoundingClientRect(), e = this.board.svgDom, f = c.left - this.board.offset().left, g = c.top - this.board.offset().top, h = c.height;
      b = Math.max(-c.width + Entry.BOARD_PADDING - f, b);
      a = Math.max(-h + Entry.BOARD_PADDING - g, a);
      b = Math.min(e.width() - Entry.BOARD_PADDING - f, b);
      a = Math.min(e.height() - Entry.BOARD_PADDING - g, a);
      this._scroll(b, a);
      this._diffs || (this._diffs = [0, 0]);
      this._diffs[0] += b;
      this._diffs[1] += a;
      this._scrollCommand("scrollBoard", this._diffs[0], this._diffs[1], !0);
    }
  };
  a._scroll = function(b, a) {
    this.board.code.moveBy(b, a);
    this.updateScrollBar(b, a);
  };
  a.setVisible = function(b) {
    b != this.isVisible() && (this._visible = b, this.svgGroup.attr({display:!0 === b ? "block" : "none"}));
  };
  a.isVisible = function() {
    return this._visible;
  };
  a.setOpacity = function(b) {
    this._opacity != b && (this.hScrollbar.attr({opacity:b}), this.vScrollbar.attr({opacity:b}), this._opacity = b);
  };
  a.resizeScrollBar = function() {
    if (this._visible) {
      var b = this.board, a = b.svgBlockGroup.getBoundingClientRect(), d = b.svgDom, e = d.width(), d = d.height(), f = a.left - b.offset().left, b = a.top - b.offset().top, g = a.width, a = a.height;
      if (this._horizontal) {
        var h = -g + Entry.BOARD_PADDING, k = e - Entry.BOARD_PADDING, g = (e + 2 * Entry.Scroller.RADIUS) * g / (k - h + g);
        isNaN(g) && (g = 0);
        this.hX = (f - h) / (k - h) * (e - g - 2 * Entry.Scroller.RADIUS);
        this.hScrollbar.attr({width:g, x:this.hX, y:d - 2 * Entry.Scroller.RADIUS});
        this.hRatio = (e - g - 2 * Entry.Scroller.RADIUS) / (k - h);
      }
      this._vertical && (f = -a + Entry.BOARD_PADDING, g = d - Entry.BOARD_PADDING, a = (d + 2 * Entry.Scroller.RADIUS) * a / (g - f + a), this.vY = (b - f) / (g - f) * (d - a - 2 * Entry.Scroller.RADIUS), this.vScrollbar.attr({height:a, y:this.vY, x:e - 2 * Entry.Scroller.RADIUS}), this.vRatio = (d - a - 2 * Entry.Scroller.RADIUS) / (g - f));
    }
  };
  a._bindEvent = function() {
    var b = _.debounce(this.resizeScrollBar, 200);
    this.board.changeEvent.attach(this, b);
    Entry.windowResized && Entry.windowResized.attach(this, b);
  };
})(Entry.Scroller.prototype);
Entry.Board = function(a) {
  Entry.Model(this, !1);
  this.changeEvent = new Entry.Event(this);
  this.createView(a);
  this.updateOffset();
  this.scroller = new Entry.Scroller(this, !0, !0);
  this._magnetMap = {};
  Entry.ANIMATION_DURATION = 200;
  Entry.BOARD_PADDING = 100;
  this._initContextOptions();
  Entry.Utils.disableContextmenu(this.svgDom);
  this._addControl();
  this._bindEvent();
};
Entry.Board.OPTION_PASTE = 0;
Entry.Board.OPTION_ALIGN = 1;
Entry.Board.OPTION_CLEAR = 2;
Entry.Board.OPTION_DOWNLOAD = 3;
Entry.Board.DRAG_RADIUS = 5;
(function(a) {
  a.schema = {code:null, dragBlock:null, magnetedBlockView:null, selectedBlockView:null};
  a.createView = function(b) {
    var a = b.dom, a = "string" === typeof a ? $("#" + a) : $(a);
    if ("DIV" !== a.prop("tagName")) {
      return console.error("Dom is not div element");
    }
    this.view = a;
    this._svgId = "play" + (new Date).getTime();
    this.workspace = b.workspace;
    this._activatedBlockView = null;
    this.wrapper = Entry.Dom("div", {parent:a, class:"entryBoardWrapper"});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="entryBoard" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.wrapper});
    this.visible = !0;
    var d = this;
    this.svg = Entry.SVG(this._svgId);
    $(window).scroll(function() {
      d.updateOffset();
    });
    this.svgGroup = this.svg.elem("g");
    this.svgThreadGroup = this.svgGroup.elem("g");
    this.svgThreadGroup.board = this;
    this.svgBlockGroup = this.svgGroup.elem("g");
    this.svgBlockGroup.board = this;
    b.isOverlay ? (this.wrapper.addClass("entryOverlayBoard"), this.generateButtons(), this.suffix = "overlayBoard") : this.suffix = "board";
    Entry.Utils.addFilters(this.svg, this.suffix);
    this.pattern = Entry.Utils.addBlockPattern(this.svg, this.suffix).pattern;
  };
  a.changeCode = function(b) {
    this.code && this.codeListener && this.code.changeEvent.detach(this.codeListener);
    this.set({code:b});
    var a = this;
    b && (this.codeListener = this.code.changeEvent.attach(this, function() {
      a.changeEvent.notify();
    }), b.createView(this));
    this.scroller.resizeScrollBar();
  };
  a.bindCodeView = function(b) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = b.svgBlockGroup;
    this.svgThreadGroup = b.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
  };
  a.setMagnetedBlock = function(b, a) {
    if (this.magnetedBlockView) {
      if (this.magnetedBlockView === b) {
        return;
      }
      this.magnetedBlockView.set({magneting:!1});
    }
    this.set({magnetedBlockView:b});
    b && (b.set({magneting:a}), b.dominate());
  };
  a.getCode = function() {
    return this.code;
  };
  a.findById = function(b) {
    return this.code.findById(b);
  };
  a._addControl = function() {
    var b = this.svgDom, a = this;
    b.mousedown(function() {
      a.onMouseDown.apply(a, arguments);
    });
    b.bind("touchstart", function() {
      a.onMouseDown.apply(a, arguments);
    });
    b.on("wheel", function() {
      a.mouseWheel.apply(a, arguments);
    });
    var d = a.scroller;
    d && (b.mouseenter(function(b) {
      d.setOpacity(1);
    }), b.mouseleave(function(b) {
      d.setOpacity(0);
    }));
  };
  a.onMouseDown = function(b) {
    function a(b) {
      b.stopPropagation && b.stopPropagation();
      b.preventDefault && b.preventDefault();
      b = Entry.Utils.convertMouseEvent(b);
      var a = e.mouseDownCoordinate;
      Math.sqrt(Math.pow(b.pageX - a.x, 2) + Math.pow(b.pageY - a.y, 2)) < Entry.Board.DRAG_RADIUS || (f && (clearTimeout(f), f = null), a = e.dragInstance, e.scroller.scroll(b.pageX - a.offsetX, b.pageY - a.offsetY), a.set({offsetX:b.pageX, offsetY:b.pageY}));
    }
    function d(b) {
      f && (clearTimeout(f), f = null);
      $(document).unbind(".entryBoard");
      delete e.mouseDownCoordinate;
      delete e.dragInstance;
    }
    if (this.workspace.getMode() != Entry.Workspace.MODE_VIMBOARD) {
      b.stopPropagation && b.stopPropagation();
      b.preventDefault && b.preventDefault();
      var e = this, f = null;
      if (0 === b.button || b.originalEvent && b.originalEvent.touches) {
        var g = b.type, h = Entry.Utils.convertMouseEvent(b);
        Entry.documentMousedown && Entry.documentMousedown.notify(h);
        var k = $(document);
        this.mouseDownCoordinate = {x:h.pageX, y:h.pageY};
        k.bind("mousemove.entryBoard", a);
        k.bind("mouseup.entryBoard", d);
        k.bind("touchmove.entryBoard", a);
        k.bind("touchend.entryBoard", d);
        this.dragInstance = new Entry.DragInstance({startX:h.pageX, startY:h.pageY, offsetX:h.pageX, offsetY:h.pageY});
        "touchstart" === g && (f = setTimeout(function() {
          f && (f = null, d(), e._rightClick(b));
        }, 1E3));
      } else {
        Entry.Utils.isRightButton(b) && this._rightClick(b);
      }
    }
  };
  a.mouseWheel = function(b) {
    b = b.originalEvent;
    b.preventDefault();
    var a = Entry.disposeEvent;
    a && a.notify(b);
    this.scroller.scroll(b.wheelDeltaX || -b.deltaX, b.wheelDeltaY || -b.deltaY);
  };
  a.setSelectedBlock = function(b) {
    var a = this.selectedBlockView;
    a && a.removeSelected();
    b instanceof Entry.BlockView ? b.addSelected() : b = null;
    this.set({selectedBlockView:b});
  };
  a._keyboardControl = function(b) {
    var a = this.selectedBlockView;
    a && 46 == b.keyCode && a.block && !Entry.Utils.isInInput(b) && (Entry.do("destroyBlock", a.block), this.set({selectedBlockView:null}));
  };
  a.hide = function() {
    this.wrapper.addClass("entryRemove");
    this.visible = !1;
  };
  a.show = function() {
    this.wrapper.removeClass("entryRemove");
    this.visible = !0;
  };
  a.alignThreads = function() {
    for (var b = this.svgDom.height(), a = this.code.getThreads(), d = 15, e = 0, b = b - 30, f = 50, g = 0;g < a.length;g++) {
      var h = a[g].getFirstBlock();
      if (h && (h = h.view, h.movable)) {
        var k = h.svgGroup.getBBox(), m = d + 15;
        m > b && (f = f + e + 10, e = 0, d = 15);
        e = Math.max(e, k.width);
        m = d + 15;
        h._moveTo(f - k.x, m, !1);
        d = d + k.height + 15;
      }
    }
    this.scroller.resizeScrollBar();
  };
  a.clear = function() {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
  };
  a.updateOffset = function() {
    this._offset = this.svg.getBoundingClientRect();
    var b = $(window), a = b.scrollTop(), b = b.scrollLeft(), d = this._offset;
    this.relativeOffset = {top:d.top - a, left:d.left - b};
    this.btnWrapper && this.btnWrapper.attr({transform:"translate(" + (d.width / 2 - 65) + "," + (d.height - 200) + ")"});
  };
  a.generateButtons = function() {
    var b = this, a = this.svgGroup.elem("g");
    this.btnWrapper = a;
    var d = a.elem("text", {x:27, y:33, class:"entryFunctionButtonText"});
    d.textContent = Lang.Buttons.save;
    var e = a.elem("text", {x:102.5, y:33, class:"entryFunctionButtonText"});
    e.textContent = Lang.Buttons.cancel;
    var f = a.elem("circle", {cx:27.5, cy:27.5, r:27.5, class:"entryFunctionButton"}), a = a.elem("circle", {cx:102.5, cy:27.5, r:27.5, class:"entryFunctionButton"});
    $(f).bind("mousedown touchstart", function() {
      b.save();
    });
    $(d).bind("mousedown touchstart", function() {
      b.save();
    });
    $(a).bind("mousedown touchstart", function() {
      b.cancelEdit();
    });
    $(e).bind("mousedown touchstart", function() {
      b.cancelEdit();
    });
  };
  a.cancelEdit = function() {
    this.workspace.setMode(Entry.Workspace.MODE_BOARD, "cancelEdit");
  };
  a.save = function() {
    this.workspace.setMode(Entry.Workspace.MODE_BOARD, "save");
  };
  a.generateCodeMagnetMap = function() {
    var b = this.code, a = this.dragBlock;
    if (b && a) {
      this._magnetMap = {};
      for (var d in a.magnet) {
        if ("next" !== d || void 0 !== a.block.getLastBlock().view.magnet.next) {
          var e = this._getCodeBlocks(b, d);
          e.sort(function(b, a) {
            return b.point - a.point;
          });
          e.unshift({point:-Number.MAX_VALUE, blocks:[]});
          for (var f = 1;f < e.length;f++) {
            var g = e[f], h = g, k = g.startBlock;
            if (k) {
              for (var m = g.endPoint, l = f;m > h.point && (h.blocks.push(k), l++, h = e[l], h);) {
              }
              delete g.startBlock;
            }
            g.endPoint = Number.MAX_VALUE;
            e[f - 1].endPoint = g.point;
          }
          this._magnetMap[d] = e;
        }
      }
    }
  };
  a._getCodeBlocks = function(b, a) {
    b = b.getThreads();
    var c = [], e;
    switch(a) {
      case "previous":
        e = this._getNextMagnets;
        break;
      case "next":
        e = this._getPreviousMagnets;
        break;
      case "string":
      case "boolean":
        e = this._getFieldMagnets;
        break;
      case "param":
        e = this._getOutputMagnets;
        break;
      default:
        return [];
    }
    for (var f = 0;f < b.length;f++) {
      var g = b[f], c = c.concat(e.call(this, g, g.view.zIndex, null, a));
    }
    return c;
  };
  a._getNextMagnets = function(b, a, d, e) {
    var c = b.getBlocks(), g = [], h = [];
    d || (d = {x:0, y:0});
    var k = d.x;
    d = d.y;
    for (var m = 0;m < c.length;m++) {
      var l = c[m], n = l.view;
      n.zIndex = a;
      if (n.dragInstance) {
        break;
      }
      d += n.y;
      k += n.x;
      b = d + 1;
      n.magnet.next && (b += n.height, h.push({point:d, endPoint:b, startBlock:l, blocks:[]}), h.push({point:b, blocks:[]}), n.absX = k);
      l.statements && (a += .01);
      for (var q = 0;q < l.statements.length;q++) {
        b = l.statements[q];
        var r = l.view._statements[q];
        r.zIndex = a;
        r.absX = k + r.x;
        h.push({point:r.y + d - 30, endPoint:r.y + d, startBlock:r, blocks:[]});
        h.push({point:r.y + d + r.height, blocks:[]});
        a += .01;
        g = g.concat(this._getNextMagnets(b, a, {x:r.x + k, y:r.y + d}, e));
      }
      n.magnet.next && (d += n.magnet.next.y, k += n.magnet.next.x);
    }
    return g.concat(h);
  };
  a._getPreviousMagnets = function(b, a, d, e) {
    var c = b.getBlocks();
    b = [];
    d || (d = {x:0, y:0});
    e = d.x;
    d = d.y;
    var c = c[0], g = c.view;
    g.zIndex = a;
    if (g.dragInstance) {
      return [];
    }
    d += g.y - 15;
    e += g.x;
    return g.magnet.previous ? (a = d + 1 + g.height, b.push({point:d, endPoint:a, startBlock:c, blocks:[]}), b.push({point:a, blocks:[]}), g.absX = e, b) : [];
  };
  a._getFieldMagnets = function(b, a, d, e) {
    var c = b.getBlocks(), g = [], h = [];
    d || (d = {x:0, y:0});
    var k = d.x;
    d = d.y;
    for (var m = 0;m < c.length;m++) {
      var l = c[m], n = l.view;
      if (n.dragInstance) {
        break;
      }
      n.zIndex = a;
      d += n.y;
      k += n.x;
      h = h.concat(this._getFieldBlockMetaData(n, k, d, a, e));
      l.statements && (a += .01);
      for (var q = 0;q < l.statements.length;q++) {
        b = l.statements[q];
        var r = l.view._statements[q], g = g.concat(this._getFieldMagnets(b, a, {x:r.x + k, y:r.y + d}, e));
      }
      n.magnet.next && (d += n.magnet.next.y, k += n.magnet.next.x);
    }
    return g.concat(h);
  };
  a._getFieldBlockMetaData = function(b, a, d, e, f) {
    var c = b._contents, h = [];
    d += b.contentPos.y;
    for (var k = 0;k < c.length;k++) {
      var m = c[k];
      if (m instanceof Entry.FieldBlock) {
        var l = m._valueBlock;
        if (!l.view.dragInstance && (m.acceptType === f || "boolean" === m.acceptType)) {
          var n = a + m.box.x, q = d + m.box.y + b.contentHeight % 1E3 * -.5, r = d + m.box.y + m.box.height;
          m.acceptType === f && (h.push({point:q, endPoint:r, startBlock:l, blocks:[]}), h.push({point:r, blocks:[]}));
          m = l.view;
          m.absX = n;
          m.zIndex = e;
          h = h.concat(this._getFieldBlockMetaData(m, n + m.contentPos.x, q + m.contentPos.y, e + .01, f));
        }
      }
    }
    return h;
  };
  a._getOutputMagnets = function(b, a, d, e) {
    var c = b.getBlocks(), g = [], h = [];
    d || (d = {x:0, y:0});
    var k = d.x;
    d = d.y;
    for (var m = 0;m < c.length;m++) {
      var l = c[m], n = l.view;
      if (n.dragInstance) {
        break;
      }
      n.zIndex = a;
      d += n.y;
      k += n.x;
      h = h.concat(this._getOutputMetaData(n, k, d, a, e));
      l.statements && (a += .01);
      for (var q = 0;q < l.statements.length;q++) {
        b = l.statements[q];
        var r = l.view._statements[q], g = g.concat(this._getOutputMagnets(b, a, {x:r.x + k, y:r.y + d}, e));
      }
      n.magnet.next && (d += n.magnet.next.y, k += n.magnet.next.x);
    }
    return g.concat(h);
  };
  a._getOutputMetaData = function(b, a, d, e, f) {
    var c = b._contents, h = [];
    a += b.contentPos.x;
    d += b.contentPos.y;
    for (b = 0;b < c.length;b++) {
      var k = c[b], m = a + k.box.x, l = d - 24, n = d;
      k instanceof Entry.FieldBlock ? (k.acceptType === f && (h.push({point:l, endPoint:n, startBlock:k, blocks:[]}), h.push({point:n, blocks:[]}), k.absX = m, k.zIndex = e, k.width = 20), (l = k._valueBlock) && (h = h.concat(this._getOutputMetaData(l.view, m, d + k.box.y, e + .01, f)))) : k instanceof Entry.FieldOutput && k.acceptType === f && (h.push({point:l, endPoint:n, startBlock:k, blocks:[]}), h.push({point:n, blocks:[]}), k.absX = m, k.zIndex = e, k.width = 20, (l = k._valueBlock) && (l.view.dragInstance || 
      (h = h.concat(this._getOutputMetaData(l.view, a + k.box.x, d + k.box.y, e + .01, f)))));
    }
    return h;
  };
  a.getNearestMagnet = function(b, a, d) {
    var c = this._magnetMap[d];
    if (c && 0 !== c.length) {
      var f = 0, g = c.length - 1, h, k = null, m = "previous" === d ? a - 15 : a;
      for (a = -1 < ["previous", "next"].indexOf(d) ? 20 : 0;f <= g;) {
        if (h = (f + g) / 2 | 0, d = c[h], m < d.point) {
          g = h - 1;
        } else {
          if (m > d.endPoint) {
            f = h + 1;
          } else {
            c = d.blocks;
            for (f = 0;f < c.length;f++) {
              if (g = c[f].view, g.absX - a < b && b < g.absX + g.width && (g = d.blocks[f], !k || k.view.zIndex < g.view.zIndex)) {
                k = d.blocks[f];
              }
            }
            return k;
          }
        }
      }
      return null;
    }
  };
  a.dominate = function(b) {
    b && (b = b.getFirstBlock()) && (this.svgBlockGroup.appendChild(b.view.svgGroup), this.code.dominate(b.thread));
  };
  a.enablePattern = function() {
    this.pattern.removeAttribute("style");
  };
  a.disablePattern = function() {
    this.pattern.attr({style:"display: none"});
  };
  a._removeActivated = function() {
    this._activatedBlockView && (this._activatedBlockView.removeActivated(), this._activatedBlockView = null);
  };
  a.activateBlock = function(b) {
    b = b.view;
    var a = b.getAbsoluteCoordinate(), d = this.svgDom, e = a.x, a = a.y, e = d.width() / 2 - e, d = d.height() / 2 - a - 100;
    this.scroller.scroll(e, d);
    b.addActivated();
    this._activatedBlockView = b;
  };
  a.reDraw = function() {
    this.code.view.reDraw();
  };
  a.separate = function(b, a) {
    "string" === typeof b && (b = this.findById(b));
    b.view && b.view._toGlobalCoordinate();
    var c = b.getPrevBlock();
    b.separate(a);
    c && c.getNextBlock() && c.getNextBlock().view.bindPrev();
  };
  a.insert = function(b, a, d) {
    "string" === typeof b && (b = this.findById(b));
    this.separate(b, d);
    3 === a.length ? b.moveTo(a[0], a[1]) : 4 === a.length && 0 === a[3] ? (a = this.code.getThreads()[a[2]], b.thread.cut(b), a.insertToTop(b), b.getNextBlock().view.bindPrev()) : (a = a instanceof Array ? this.code.getTargetByPointer(a) : a, a instanceof Entry.Block ? ("basic" === b.getBlockType() && b.view.bindPrev(a), b.doInsert(a)) : a instanceof Entry.FieldStatement ? (b.view.bindPrev(a), a.insertTopBlock(b)) : b.doInsert(a));
  };
  a.adjustThreadsPosition = function() {
    var b = this.code;
    b && (b = b.getThreads()) && 0 !== b.length && (b = b.sort(function(b, a) {
      return b.getFirstBlock().view.x - a.getFirstBlock().view.x;
    }), b = b[0].getFirstBlock()) && (b = b.view, b = b.getAbsoluteCoordinate(), this.scroller.scroll(50 - b.x, 30 - b.y));
  };
  a._initContextOptions = function() {
    var b = this;
    this._contextOptions = [{activated:!0, option:{text:Lang.Blocks.Paste_blocks, enable:!!Entry.clipboard, callback:function() {
      Entry.do("addThread", Entry.clipboard).value.getFirstBlock().copyToClipboard();
    }}}, {activated:!0, option:{text:Lang.Blocks.tidy_up_block, callback:function() {
      b.alignThreads();
    }}}, {activated:!0, option:{text:Lang.Blocks.Clear_all_blocks, callback:function() {
      b.code.clear(!0);
    }}}, {activated:"workspace" === Entry.type && Entry.Utils.isChrome() && !Entry.isMobile(), option:{text:Lang.Menus.save_as_image_all, enable:!0, callback:function() {
      var a = b.code.getThreads(), d = [];
      a.forEach(function(b, c) {
        if (b = b.getFirstBlock()) {
          console.log("threads.length=", a.length), 1 < a.length && Entry.isOffline ? b.view.getDataUrl().then(function(b) {
            d.push(b);
            d.length == a.length && Entry.dispatchEvent("saveBlockImages", {images:d});
          }) : b.view.downloadAsImage(++c);
        }
      });
    }}}];
  };
  a.activateContextOption = function(b) {
    this._contextOptions[b].activated = !0;
  };
  a.deActivateContextOption = function(b) {
    this._contextOptions[b].activated = !1;
  };
  a._bindEvent = function() {
    Entry.documentMousedown && (Entry.documentMousedown.attach(this, this.setSelectedBlock), Entry.documentMousedown.attach(this, this._removeActivated));
    Entry.keyPressed && Entry.keyPressed.attach(this, this._keyboardControl);
    if (Entry.windowResized) {
      var b = _.debounce(this.updateOffset, 200);
      Entry.windowResized.attach(this, b);
    }
  };
  a.offset = function() {
    (!this._offset || 0 === this._offset.top && 0 === this._offset.left) && this.updateOffset();
    return this._offset;
  };
  a._rightClick = function(b) {
    var a = Entry.disposeEvent;
    a && a.notify(b);
    if (this.visible) {
      var a = [], d = this._contextOptions;
      d[Entry.Board.OPTION_PASTE].option.enable = !!Entry.clipboard;
      d[Entry.Board.OPTION_DOWNLOAD].option.enable = 0 !== this.code.getThreads().length;
      for (var e = 0;e < this._contextOptions.length;e++) {
        d[e].activated && a.push(d[e].option);
      }
      b = Entry.Utils.convertMouseEvent(b);
      Entry.ContextMenu.show(a, null, {x:b.clientX, y:b.clientY});
    }
  };
})(Entry.Board.prototype);
Entry.Code = function(a, b) {
  Entry.Model(this, !1);
  b && (this.object = b);
  this._data = new Entry.Collection;
  this._eventMap = {};
  this._blockMap = {};
  this.executors = [];
  this.watchEvent = new Entry.Event(this);
  this.executeEndEvent = new Entry.Event(this);
  this.changeEvent = new Entry.Event(this);
  this.changeEvent.attach(this, this._handleChange);
  this._maxZIndex = 0;
  this.load(a);
};
Entry.STATEMENT = 0;
Entry.PARAM = -1;
(function(a) {
  a.schema = {view:null, board:null};
  a.load = function(b) {
    b instanceof Array || (b = JSON.parse(b));
    this.clear();
    for (var a = 0;a < b.length;a++) {
      this._data.push(new Entry.Thread(b[a], this));
    }
    return this;
  };
  a.clear = function(b) {
    b = void 0 === b ? !1 : b;
    for (var a = this._data.length - 1;0 <= a;a--) {
      this._data[a].destroy(!1, b);
    }
    this.clearExecutors();
  };
  a.createView = function(b) {
    null === this.view ? this.set({view:new Entry.CodeView(this, b), board:b}) : (this.set({board:b}), b.bindCodeView(this.view));
  };
  a.destroyView = function() {
    this.view && (this.view.destroy(), delete this.view);
  };
  a.recreateView = function() {
    this.view && (this.destroyView(), this.set({view:new Entry.CodeView(this, this.board), board:this.board}));
  };
  a.registerEvent = function(b, a) {
    this._eventMap[a] || (this._eventMap[a] = []);
    this._eventMap[a].push(b);
  };
  a.unregisterEvent = function(b, a) {
    (a = this._eventMap[a]) && 0 !== a.length && (b = a.indexOf(b), 0 > b || a.splice(b, 1));
  };
  a.raiseEvent = function(b, a, d) {
    b = this._eventMap[b];
    var c = [];
    if (void 0 !== b) {
      for (var f = 0;f < b.length;f++) {
        var g = b[f];
        if (void 0 === d || -1 < g.params.indexOf(d)) {
          g = new Entry.Executor(b[f], a), this.executors.push(g), c.push(g);
        }
      }
      return c;
    }
  };
  a.getEventMap = function(b) {
    return this._eventMap[b];
  };
  a.map = function(b) {
    this._data.map(b);
  };
  a.tick = function() {
    for (var b = this.executors, a = [], d = 0;d < b.length;d++) {
      var e = b[d];
      e.isEnd() ? (b.splice(d--, 1), 0 === b.length && this.executeEndEvent.notify()) : a = a.concat(e.execute());
    }
    this.watchEvent.notify(a);
  };
  a.removeExecutor = function(b) {
    b = this.executors.indexOf(b);
    -1 < b && this.executors.splice(b, 1);
  };
  a.clearExecutors = function() {
    this.executors.forEach(function(b) {
      b.end();
    });
    this.executors = [];
  };
  a.clearExecutorsByEntity = function(b) {
    for (var a = this.executors, d = 0;d < a.length;d++) {
      var e = a[d];
      e.entity === b && e.end();
    }
  };
  a.addExecutor = function(b) {
    this.executors.push(b);
  };
  a.createThread = function(b, a) {
    if (!(b instanceof Array)) {
      return console.error("blocks must be array");
    }
    b = new Entry.Thread(b, this);
    void 0 === a ? this._data.push(b) : this._data.insert(b, a);
    this.changeEvent.notify();
    return b;
  };
  a.cloneThread = function(b, a) {
    b = b.clone(this, a);
    this._data.push(b);
    return b;
  };
  a.destroyThread = function(b, a) {
    a = this._data;
    b = a.indexOf(b);
    0 > b || a.splice(b, 1);
  };
  a.doDestroyThread = function(b, a) {
    a = this._data;
    b = a.indexOf(b);
    0 > b || a.splice(b, 1);
  };
  a.getThreads = function() {
    return this._data.map(function(b) {
      return b;
    });
  };
  a.toJSON = function(b) {
    for (var a = this.getThreads(), d = [], e = 0, f = a.length;e < f;e++) {
      d.push(a[e].toJSON(!1, void 0, b));
    }
    return d;
  };
  a.countBlock = function() {
    for (var b = this.getThreads(), a = 0, d = 0;d < b.length;d++) {
      a += b[d].countBlock();
    }
    return a;
  };
  a.moveBy = function(b, a) {
    for (var c = this.getThreads(), e = 0, f = c.length;e < f;e++) {
      var g = c[e].getFirstBlock();
      g && g.view._moveBy(b, a, !1);
    }
    b = this.board;
    b instanceof Entry.BlockMenu && b.updateSplitters(a);
  };
  a.stringify = function(b) {
    return JSON.stringify(this.toJSON(b));
  };
  a.dominate = function(b) {
    b.view.setZIndex(this._maxZIndex++);
  };
  a.indexOf = function(b) {
    return this._data.indexOf(b);
  };
  a._handleChange = function() {
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  };
  a.hasBlockType = function(b) {
    for (var a = this.getThreads(), d = 0;d < a.length;d++) {
      if (a[d].hasBlockType(b)) {
        return !0;
      }
    }
    return !1;
  };
  a.findById = function(b) {
    return this._blockMap[b];
  };
  a.registerBlock = function(b) {
    this._blockMap[b.id] = b;
  };
  a.unregisterBlock = function(b) {
    delete this._blockMap[b.id];
  };
  a.getByPointer = function(b) {
    b = b.concat();
    b.shift();
    b.shift();
    for (var a = this._data[b.shift()].getBlock(b.shift());b.length;) {
      a instanceof Entry.Block || (a = a.getValueBlock());
      var d = b.shift(), e = b.shift();
      -1 < d ? a = a.statements[d].getBlock(e) : -1 === d && (a = a.view.getParam(e));
    }
    return a;
  };
  a.getTargetByPointer = function(b) {
    b = b.concat();
    b.shift();
    b.shift();
    var a = this._data[b.shift()], d;
    if (1 === b.length) {
      d = a.getBlock(b.shift() - 1);
    } else {
      for (d = a.getBlock(b.shift());b.length;) {
        d instanceof Entry.Block || (d = d.getValueBlock());
        var e = b.shift(), a = b.shift();
        -1 < e ? (d = d.statements[e], d = b.length ? d.getBlock(a) : 0 === a ? d.view.getParent() : d.getBlock(a - 1)) : -1 === e && (d = d.view.getParam(a));
      }
    }
    return d;
  };
  a.getBlockList = function(b, a) {
    for (var c = this.getThreads(), e = [], f = 0;f < c.length;f++) {
      e = e.concat(c[f].getBlockList(b, a));
    }
    return e;
  };
  a.removeBlocksByType = function(b) {
    this.getBlockList(!1, b).forEach(function(b) {
      b.doDestroy();
    });
  };
})(Entry.Code.prototype);
Entry.CodeView = function(a, b) {
  Entry.Model(this, !1);
  this.code = a;
  this.set({board:b});
  this.svgThreadGroup = b.svgGroup.elem("g");
  this.svgThreadGroup.attr({class:"svgThreadGroup"});
  this.svgThreadGroup.board = b;
  this.svgBlockGroup = b.svgGroup.elem("g");
  this.svgBlockGroup.attr({class:"svgBlockGroup"});
  this.svgBlockGroup.board = b;
  b.bindCodeView(this);
  this.code._data.getAll().forEach(function(a) {
    a.createView(b);
  });
  a.observe(this, "_setBoard", ["board"]);
};
(function(a) {
  a.schema = {board:null, scrollX:0, scrollY:0};
  a._setBoard = function() {
    this.set({board:this.code.board});
  };
  a.reDraw = function() {
    this.code.map(function(b) {
      b.view.reDraw();
    });
  };
  a.destroy = function() {
    this.code.map(function(b) {
      b.destroyView();
    });
  };
})(Entry.CodeView.prototype);
Entry.ConnectionRipple = {};
(function(a) {
  a.createDom = function(b) {
    this.svgDom || (this._ripple = b.getBoard().svgGroup.elem("circle", {cx:0, cy:0, r:0, stroke:"#888", "stroke-width":10}));
  };
  a.setView = function(b) {
    this._ripple || this.createDom(b);
    var a = this._ripple, d = b.getBoard().svgGroup;
    a.remove();
    b = b.getAbsoluteCoordinate();
    a.attr({cx:b.x, cy:b.y});
    d.appendChild(a);
    a._startTime = new Date;
    return this;
  };
  a.dispose = function() {
    var b = this, a = this._ripple, d = (new Date - a._startTime) / 150;
    1 < d ? a.remove() : (a.attr({r:25 * d, opacity:1 - d}), window.setTimeout(function() {
      b.dispose();
    }, 10));
  };
})(Entry.ConnectionRipple);
Entry.Executor = function(a, b) {
  this.scope = new Entry.Scope(a, this);
  this.entity = b;
  this._callStack = [];
  this.register = {};
};
(function(a) {
  a.execute = function() {
    if (!this.isEnd()) {
      for (var b = [];;) {
        var a = null;
        b.push(this.scope.block);
        try {
          var d = this.scope.block.getSchema();
          d && (a = d.func.call(this.scope, this.entity, this.scope));
        } catch (f) {
          if ("AsyncError" === f.name) {
            a = Entry.STATIC.BREAK;
          } else {
            var e = !1;
            "\ub7f0\ud0c0\uc784 \uc5d0\ub7ec" != f.message && (e = !0);
            Entry.Utils.stopProjectWithToast(this.scope, "\ub7f0\ud0c0\uc784 \uc5d0\ub7ec", e);
          }
        }
        if (this.isEnd()) {
          break;
        }
        if (void 0 === a || null === a || a === Entry.STATIC.PASS) {
          if (this.scope = new Entry.Scope(this.scope.block.getNextBlock(), this), null === this.scope.block) {
            if (this._callStack.length) {
              if (a = this.scope, this.scope = this._callStack.pop(), this.scope.isLooped !== a.isLooped) {
                break;
              }
            } else {
              break;
            }
          }
        } else {
          if (a !== Entry.STATIC.CONTINUE && (a === Entry.STATIC.BREAK || this.scope === a)) {
            break;
          }
        }
      }
      return b;
    }
  };
  a.stepInto = function(b) {
    b instanceof Entry.Thread || console.error("Must step in to thread");
    b = b.getFirstBlock();
    if (!b) {
      return Entry.STATIC.BREAK;
    }
    this._callStack.push(this.scope);
    this.scope = new Entry.Scope(b, this);
    return Entry.STATIC.CONTINUE;
  };
  a.break = function() {
    this._callStack.length && (this.scope = this._callStack.pop());
    return Entry.STATIC.PASS;
  };
  a.breakLoop = function() {
    this._callStack.length && (this.scope = this._callStack.pop());
    for (;this._callStack.length && "repeat" !== Entry.block[this.scope.block.type].class;) {
      this.scope = this._callStack.pop();
    }
    return Entry.STATIC.PASS;
  };
  a.end = function() {
    this.scope.block = null;
  };
  a.isEnd = function() {
    return null === this.scope.block;
  };
})(Entry.Executor.prototype);
Entry.Scope = function(a, b) {
  this.type = (this.block = a) ? a.type : null;
  this.executor = b;
  this.entity = b.entity;
};
(function(a) {
  a.callReturn = function() {
  };
  a.getParam = function(b) {
    b = this.block.params[b];
    var a = new Entry.Scope(b, this.executor);
    return Entry.block[b.type].func.call(a, this.entity, a);
  };
  a.getParams = function() {
    var b = this;
    return this.block.params.map(function(a) {
      if (a instanceof Entry.Block) {
        var c = new Entry.Scope(a, b.executor);
        return Entry.block[a.type].func.call(c, b.entity, c);
      }
      return a;
    });
  };
  a.getValue = function(b, a) {
    b = this.block.params[this._getParamIndex(b, a)];
    a = new Entry.Scope(b, this.executor);
    return Entry.block[b.type].func.call(a, this.entity, a);
  };
  a.getStringValue = function(b, a) {
    return String(this.getValue(b, a));
  };
  a.getNumberValue = function(b, a) {
    return Number(this.getValue(b));
  };
  a.getBooleanValue = function(b, a) {
    return Number(this.getValue(b, a)) ? !0 : !1;
  };
  a.getField = function(b, a) {
    return this.block.params[this._getParamIndex(b)];
  };
  a.getStringField = function(b, a) {
    return String(this.getField(b));
  };
  a.getNumberField = function(b) {
    return Number(this.getField(b));
  };
  a.getStatement = function(b, a) {
    return this.executor.stepInto(this.block.statements[this._getStatementIndex(b, a)]);
  };
  a._getParamIndex = function(b) {
    this._schema || (this._schema = Entry.block[this.type]);
    return this._schema.paramsKeyMap[b];
  };
  a._getStatementIndex = function(b) {
    this._schema || (this._schema = Entry.block[this.type]);
    return this._schema.statementsKeyMap[b];
  };
  a.die = function() {
    this.block = null;
    return Entry.STATIC.BREAK;
  };
})(Entry.Scope.prototype);
Entry.BlockExtension = function(a, b) {
};
(function(a) {
})(Entry.BlockExtension.prototype);
Entry.ExtGuide = function(a, b, c) {
  this.blockView = b;
  this.block = b.block;
  this.model = a.model ? a.model : [];
  this.render();
};
(function(a) {
  a.render = function() {
    if (this.model) {
      var b = this.blockView.getBoard();
      this.svgGroup = this.blockView.svgGroup.elem("g", {class:"extension guideGroup"});
      this.blockView.guideSvgGroup = this.svgGroup;
      $(this.svgGroup).bind("mousedown touchstart", function(b) {
        b.stopPropagation && b.stopPropagation();
        b.preventDefault && b.preventDefault();
      });
      var a = this.block.getCode();
      this.model[0].x = -99999;
      this.model[0].y = -99999;
      a = a.createThread(this.model);
      !a.view && a.createView(b);
      b = a.getFirstBlock().view.clone();
      b.removeAttribute("transform");
      this.svgGroup.appendChild(b);
      this.updatePos();
      this.block.getThread().view.setHasGuide(!0);
      a.destroy(!1);
    }
  };
  a.updatePos = function() {
    this.svgGroup.attr("transform", this._getTransform());
  };
  a._getTransform = function() {
    return "translate(0,%y)".replace("%y", this.blockView.magnet.next.y);
  };
})(Entry.ExtGuide.prototype);
Entry.ExtSideTag = function(a, b, c) {
  this.blockView = b;
  this.color = a.color ? a.color : "#EBC576";
  this.text = a.text ? a.text : "";
  this.height = a.height ? Number(a.height) : 31 * Number(a.count);
  this.render();
  this.updatePos();
};
(function(a) {
  a.render = function() {
    this.svgGroup = this.blockView.svgGroup.elem("g");
    $(this.svgGroup).bind("mousedown touchstart", function(b) {
      b.stopPropagation && b.stopPropagation();
      b.preventDefault && b.preventDefault();
    });
    this.path = this.svgGroup.elem("path").attr({d:"m0,2 h-9 v" + (this.height - 4) + " h9", stroke:this.color, fill:"transparent", "stroke-width":"3"});
    this.textElement = this.svgGroup.elem("text").attr({style:"white-space: pre;", "font-size":"10px", "font-family":"nanumBarunRegular", "class":"dragNone", fill:"#000000"});
    this.tspans = this.text.split("\n").map(function(b) {
      var a = this.textElement.elem("tspan").attr({dy:"1.2em", x:"0", "class":"extension sideTagTspan"});
      a.textContent = b;
      return a;
    }.bind(this));
  };
  a.updatePos = function() {
    this.positionX = 8 * -(this.blockView.block.pointer().length - 2);
    this.svgGroup.attr("transform", "translate(" + this.positionX + ",0)");
    this.textElement.attr({y:this.height / 2 - 12 * (this.tspans.length - 1) - 2});
    var b = this.textElement.getBoundingClientRect();
    this.tspans.map(function(a) {
      a.attr({x:-b.width - 14});
    });
  };
})(Entry.ExtSideTag.prototype);
Entry.FieldAngle = function(a, b, c) {
  this._block = b.block;
  this._blockView = b;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = a.position;
  this._contents = a;
  this._index = c;
  a = this.getValue();
  this.setValue(this.modValue(void 0 !== a ? a : 90));
  this._CONTENT_HEIGHT = this.getContentHeight();
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldAngle);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text", {x:4, y:4, "font-size":"11px"});
    this.textElement.textContent = this.getText();
    var b = this.getTextWidth(), a = this._CONTENT_HEIGHT;
    this._header = this.svgGroup.elem("rect", {x:0, y:(this.position && this.position.y ? this.position.y : 0) - a / 2, rx:3, ry:3, width:b, height:a, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:b, height:a});
  };
  a.renderOptions = function() {
    var b = this;
    this._attachDisposeEvent(function() {
      b.applyValue();
      b.destroyOption();
    });
    this.optionGroup = Entry.Dom("input", {class:"entry-widget-input-field", parent:$("body")});
    this.optionGroup.val(this.value);
    this.optionGroup.on("mousedown touchstart", function(b) {
      b.stopPropagation();
    });
    this.optionGroup.on("keyup", function(a) {
      var c = a.keyCode || a.which;
      b.applyValue(a);
      -1 < [13, 27].indexOf(c) && b.destroyOption();
    });
    var a = this.getAbsolutePosFromDocument();
    a.y -= this.box.height / 2;
    this.optionGroup.css({height:this._CONTENT_HEIGHT, left:a.x, top:a.y, width:b.box.width});
    this.svgOptionGroup = this.appendSvgOptionGroup();
    this.svgOptionGroup.elem("circle", {x:0, y:0, r:49, class:"entry-field-angle-circle"});
    $(this.svgOptionGroup).on("mousedown touchstart", function(a) {
      a.stopPropagation();
      b._updateByCoord(a);
    });
    this._dividerGroup = this.svgOptionGroup.elem("g");
    for (a = 0;360 > a;a += 15) {
      this._dividerGroup.elem("line", {x1:49, y1:0, x2:49 - (0 === a % 45 ? 10 : 5), y2:0, transform:"rotate(" + a + ", 0, 0)", class:"entry-angle-divider"});
    }
    a = this.getAbsolutePosFromBoard();
    a.x += this.box.width / 2;
    a.y = a.y + this.box.height / 2 + 49 + 1;
    this.svgOptionGroup.attr({class:"entry-field-angle", transform:"translate(" + a.x + "," + a.y + ")"});
    $(this.svgOptionGroup).bind("mousemove touchmove", this._updateByCoord.bind(this));
    $(this.svgOptionGroup).bind("mouseup touchend", this.destroyOption.bind(this));
    this.updateGraph();
    this.optionGroup.focus();
    this.optionGroup.select();
  };
  a._updateByCoord = function(b) {
    b.originalEvent && b.originalEvent.touches && (b = b.originalEvent.touches[0]);
    b = [b.clientX, b.clientY];
    var a = this.getAbsolutePosFromDocument();
    this.optionGroup.val(this.modValue(function(b, a) {
      var c = a[0] - b[0];
      b = a[1] - b[1] - 49 - 1;
      a = Math.atan(-b / c);
      a = Entry.toDegrees(a);
      a = 90 - a;
      0 > c ? a += 180 : 0 < b && (a += 360);
      return 15 * Math.round(a / 15);
    }([a.x + this.box.width / 2, a.y + this.box.height / 2 + 1], b)));
    this.applyValue();
  };
  a.updateGraph = function() {
    this._fillPath && this._fillPath.remove();
    var a = Entry.toRadian(this.getValue()), c = 49 * Math.sin(a), d = -49 * Math.cos(a), a = a > Math.PI ? 1 : 0;
    this._fillPath = this.svgOptionGroup.elem("path", {d:"M 0,0 v -49 A 49,49 0 %LARGE 1 %X,%Y z".replace("%X", c).replace("%Y", d).replace("%LARGE", a), class:"entry-angle-fill-area"});
    this.svgOptionGroup.appendChild(this._dividerGroup);
    this._indicator && this._indicator.remove();
    this._indicator = this.svgOptionGroup.elem("line", {x1:0, y1:0, x2:c, y2:d});
    this._indicator.attr({class:"entry-angle-indicator"});
  };
  a.applyValue = function() {
    var a = this.optionGroup.val();
    isNaN(a) || "" === a || (a = this.modValue(a), this.setValue(a), this.updateGraph(), this.textElement.textContent = this.getValue(), this.optionGroup && this.optionGroup.val(a), this.resize());
  };
  a.resize = function() {
    var a = this.getTextWidth();
    this._header.attr({width:a});
    this.optionGroup && this.optionGroup.css({width:a});
    this.box.set({width:a});
    this._block.view.alignContent();
  };
  a.getTextWidth = function() {
    return this.textElement ? this.textElement.getComputedTextLength() + 8 : 8;
  };
  a.getText = function() {
    return this.getValue() + "\u00b0";
  };
  a.modValue = function(a) {
    return a % 360;
  };
  a.destroyOption = function() {
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.documentDownEvent);
    this.optionGroup && (this.optionGroup.remove(), delete this.optionGroup);
    this.svgOptionGroup && (this.svgOptionGroup.remove(), delete this.svgOptionGroup);
    this.textElement.textContent = this.getText();
    this.command();
  };
})(Entry.FieldAngle.prototype);
Entry.FieldColor = function(a, b, c) {
  this._block = b.block;
  this._blockView = b;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = a;
  this._index = c;
  this._position = a.position;
  this.key = a.key;
  this.setValue(this.getValue() || "#FF0000");
  this._CONTENT_HEIGHT = this.getContentHeight();
  this._CONTENT_WIDTH = this.getContentWidth();
  this.renderStart(b);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldColor);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-field-color"});
    var a = this._CONTENT_HEIGHT, c = this._CONTENT_WIDTH, d = this._position, e;
    d ? (e = d.x || 0, d = d.y || 0) : (e = 0, d = -a / 2);
    this._header = this.svgGroup.elem("rect", {x:e, y:d, width:c, height:a, fill:this.getValue()});
    this._bindRenderOptions();
    this.box.set({x:e, y:d, width:c, height:a});
  };
  a.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    var c = Entry.FieldColor.getWidgetColorList();
    this.optionGroup = Entry.Dom("table", {class:"entry-widget-color-table", parent:$("body")});
    for (var d = 0;d < c.length;d++) {
      for (var e = Entry.Dom("tr", {class:"entry-widget-color-row", parent:this.optionGroup}), f = 0;f < c[d].length;f++) {
        var g = Entry.Dom("td", {class:"entry-widget-color-cell", parent:e}), h = c[d][f];
        g.css({"background-color":h});
        g.attr({"data-color-value":h});
        (function(b, c) {
          b.mousedown(function(a) {
            a.stopPropagation();
          });
          b.mouseup(function(b) {
            a.applyValue(c);
            a.destroyOption();
            a._selectBlockView();
          });
        })(g, h);
      }
    }
    c = this.getAbsolutePosFromDocument();
    c.y += this.box.height / 2 + 1;
    this.optionGroup.css({left:c.x, top:c.y});
  };
  a.applyValue = function(a) {
    this.value != a && (this.setValue(a), this._header.attr({fill:a}));
  };
  a.getContentWidth = function() {
    return Entry.isMobile() ? 20 : 14.5;
  };
})(Entry.FieldColor.prototype);
Entry.FieldColor.getWidgetColorList = function() {
  return ["#FFFFFF #CCCCCC #C0C0C0 #999999 #666666 #333333 #000000".split(" "), "#FFCCCC #FF6666 #FF0000 #CC0000 #990000 #660000 #330000".split(" "), "#FFCC99 #FF9966 #FF9900 #FF6600 #CC6600 #993300 #663300".split(" "), "#FFFF99 #FFFF66 #FFCC66 #FFCC33 #CC9933 #996633 #663333".split(" "), "#FFFFCC #FFFF33 #FFFF00 #FFCC00 #999900 #666600 #333300".split(" "), "#99FF99 #66FF99 #33FF33 #33CC00 #009900 #006600 #003300".split(" "), "#99FFFF #33FFFF #66CCCC #00CCCC #339999 #336666 #003333".split(" "), "#CCFFFF #66FFFF #33CCFF #3366FF #3333FF #000099 #000066".split(" "), 
  "#CCCCFF #9999FF #6666CC #6633FF #6609CC #333399 #330099".split(" "), "#FFCCFF #FF99FF #CC66CC #CC33CC #993399 #663366 #330033".split(" ")];
};
Entry.FieldDropdown = function(a, b, c) {
  this._block = b.block;
  this._blockView = b;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = a;
  this._noArrow = a.noArrow;
  this._arrowColor = a.arrowColor;
  this._index = c;
  this.setValue(this.getValue());
  this._CONTENT_HEIGHT = this.getContentHeight(a.dropdownHeight);
  this._FONT_SIZE = this.getFontSize(a.fontSize);
  this._ROUND = a.roundValue || 3;
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldDropdown);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this instanceof Entry.FieldDropdownDynamic && this._updateValue();
    var a = this._blockView, c = Entry.isMobile(), d = c ? 33 : 20, c = c ? 24 : 10;
    this.svgGroup = a.contentSvgGroup.elem("g", {class:"entry-field-dropdown"});
    this.textElement = this.svgGroup.elem("text", {x:5});
    this.textElement.textContent = this.getTextByValue(this.getValue());
    a = this.textElement.getBBox();
    this.textElement.attr({style:"white-space: pre;", "font-size":+this._FONT_SIZE + "px", y:.23 * a.height});
    d = this.textElement.getBoundingClientRect().width + d;
    this._noArrow && (d -= c);
    c = this._CONTENT_HEIGHT;
    this._header = this.svgGroup.elem("rect", {width:d, height:c, y:-c / 2, rx:this._ROUND, ry:this._ROUND, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._noArrow || (a = this.getArrow(), this._arrow = this.svgGroup.elem("polygon", {points:a.points, fill:a.color, stroke:a.color, transform:"translate(" + (d - a.width - 5) + "," + -a.height / 2 + ")"}));
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:d, height:c});
  };
  a.resize = function() {
    var a = Entry.isMobile(), c = a ? 33 : 20, a = a ? 24 : 10, c = this.textElement.getBoundingClientRect().width + c;
    this._noArrow ? c -= a : (a = this.getArrow(), this._arrow.attr({transform:"translate(" + (c - a.width - 5) + "," + -a.height / 2 + ")"}));
    this._header.attr({width:c});
    this.box.set({width:c});
    this._block.view.alignContent();
  };
  a.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    this.optionGroup = Entry.Dom("ul", {class:"entry-widget-dropdown", parent:$("body")});
    this.optionGroup.bind("mousedown touchstart", function(a) {
      a.stopPropagation();
    });
    for (var c = this._contents.options, c = this._contents.options, d = 0, e = c.length;d < e;d++) {
      var f = c[d], g = f[0], f = f[1], h = Entry.Dom("li", {class:"rect", parent:this.optionGroup}), k = Entry.Dom("span", {class:"left", parent:h});
      Entry.Dom("span", {class:"right", parent:h}).text(g);
      this.getValue() == f && k.text("\u2713");
      (function(b, c) {
        b.bind("mousedown touchstart", function(a) {
          a.stopPropagation();
        });
        b.bind("mouseup touchend", function(b) {
          b.stopPropagation();
          a.applyValue(c);
          a.destroyOption();
          a._selectBlockView();
        });
      })(h, f);
    }
    this._position();
  };
  a._position = function() {
    var a = this.getAbsolutePosFromDocument();
    a.y += this.box.height / 2;
    var c = $(document).height(), d = this.optionGroup.height(), e = this.optionGroup.width() + 30;
    if (c < a.y + d + 30) {
      var c = this._blockView.getBoard().svgDom.height(), f = this.getAbsolutePosFromBoard();
      this._blockView.y < c / 2 ? (a.x += this.box.width / 2 - e / 2, c -= f.y + 30, this.optionGroup.height(c)) : (a.x += this.box.width + 1, c -= c - f.y, c - 30 < d && this.optionGroup.height(c - c % 30), a.y -= this.optionGroup.height());
    } else {
      a.x += this.box.width / 2 - e / 2;
    }
    this.optionGroup.addClass("rendered");
    this.optionGroup.css({left:a.x, top:a.y, width:e});
    this.optionGroup.find(".right").width(e - 20);
  };
  a.applyValue = function(a) {
    this.value != a && this.setValue(a);
    this.textElement.textContent = this.getTextByValue(a);
    this.resize();
  };
  a.getTextByValue = function(a) {
    if (!a && "number" !== typeof a || "null" === a) {
      return Lang.Blocks.no_target;
    }
    for (var b = this._contents.options, d = 0, e = b.length;d < e;d++) {
      var f = b[d];
      if (f[1] == a) {
        return f[0];
      }
    }
    return "?" === a ? a : Lang.Blocks.no_target;
  };
  a.getContentHeight = function(a) {
    return a = a || this._blockView.getSkeleton().dropdownHeight || (Entry.isMobile() ? 22 : 16);
  };
  a.getArrow = function() {
    var a = Entry.isMobile();
    return {color:this._arrowColor || this._blockView._schema.color, points:a ? "0,0 19,0 9.5,13" : "0,0 6.4,0 3.2,4.2", height:a ? 13 : 4.2, width:a ? 19 : 6.4};
  };
})(Entry.FieldDropdown.prototype);
Entry.FieldDropdownDynamic = function(a, b, c) {
  this._block = b.block;
  this._blockView = b;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = a;
  this._index = c;
  this._arrowColor = a.arrowColor;
  c = this._contents.menuName;
  Entry.Utils.isFunction(c) ? this._menuGenerator = c : this._menuName = c;
  this._CONTENT_HEIGHT = this.getContentHeight(a.dropdownHeight);
  this._FONT_SIZE = this.getFontSize(a.fontSize);
  this._ROUND = a.roundValue || 3;
  this.renderStart(b);
};
Entry.Utils.inherit(Entry.FieldDropdown, Entry.FieldDropdownDynamic);
(function(a) {
  a.constructor = Entry.FieldDropDownDynamic;
  a._updateValue = function() {
    var a = this._block.getCode().object, c = [];
    Entry.container && (c = this._menuName ? Entry.container.getDropdownList(this._menuName, a) : this._menuGenerator());
    this._contents.options = c;
    a = this.getValue();
    if (this._blockView.isInBlockMenu || !a || "null" == a) {
      a = 0 !== c.length ? c[0][1] : null;
    }
    this.setValue(a);
  };
  a.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    this.optionGroup = Entry.Dom("ul", {class:"entry-widget-dropdown", parent:$("body")});
    this.optionGroup.bind("mousedown touchstart", function(a) {
      a.stopPropagation();
    });
    var c;
    c = this._menuName ? Entry.container.getDropdownList(this._contents.menuName) : this._menuGenerator();
    this._contents.options = c;
    for (var d = 0;d < c.length;d++) {
      var e = c[d], f = e[0], e = e[1], g = Entry.Dom("li", {class:"rect", parent:this.optionGroup}), h = Entry.Dom("span", {class:"left", parent:g});
      Entry.Dom("span", {class:"right", parent:g}).text(f);
      this.getValue() == e && h.text("\u2713");
      (function(b, c) {
        b.mousedown(function(a) {
          a.stopPropagation();
        });
        b.mouseup(function(b) {
          b.stopPropagation();
          a.applyValue(c);
          a.destroyOption();
          a._selectBlockView();
        });
      })(g, e);
    }
    this._position();
  };
})(Entry.FieldDropdownDynamic.prototype);
Entry.FieldImage = function(a, b, c) {
  this._block = b.block;
  this._blockView = b;
  this._content = a;
  this.box = new Entry.BoxModel;
  this._size = a.size;
  this._highlightColor = a.highlightColor ? a.highlightColor : "#F59900";
  this._position = a.position;
  this._imgElement = this._path = this.svgGroup = null;
  this._index = c;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldImage);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && this.svgGroup.remove();
    this._imgUrl = this._block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN ? this._content.img.replace(".png", "_un.png") : this._content.img;
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._imgElement = this.svgGroup.elem("image", {href:this._imgUrl, x:0, y:-.5 * this._size, width:this._size, height:this._size});
    this.box.set({x:this._size, y:0, width:this._size, height:this._size});
  };
})(Entry.FieldImage.prototype);
Entry.FieldIndicator = function(a, b, c) {
  this._block = b.block;
  this._blockView = b;
  this.box = new Entry.BoxModel;
  this._size = a.size;
  a.img ? this._imgUrl = this._block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN ? a.img.replace(".png", "_un.png") : a.img : a.color && (this._color = a.color);
  this._boxMultiplier = a.boxMultiplier || 2;
  this._highlightColor = a.highlightColor ? a.highlightColor : "#F59900";
  this._position = a.position;
  this._index = c;
  this._imgElement = this._path = this.svgGroup = null;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldIndicator);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && this.svgGroup.remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._imgUrl && (this._imgElement = this.svgGroup.elem("image", {href:Entry.mediaFilePath + this._imgUrl, x:this._position ? -1 * this._size : 0, y:-1 * this._size, width:2 * this._size, height:2 * this._size}));
    var a = "m %s,-%s a %s,%s 0 1,1 -0.1,0 z".replace(/%s/gi, this._size);
    this._path = this.svgGroup.elem("path", {d:a, x:this._position ? -1 * this._size : 0, y:-1 * this._size, stroke:"none", fill:this._color ? this._color : "none"});
    this.box.set({width:this._size * this._boxMultiplier + (this._position ? -this._size : 0), height:this._size * this._boxMultiplier});
  };
  a.enableHighlight = function() {
    var a = this._path.getTotalLength(), c = this._path;
    this._path.attr({stroke:this._highlightColor, strokeWidth:2, "stroke-linecap":"round", "stroke-dasharray":a + " " + a, "stroke-dashoffset":a});
    setInterval(function() {
      c.attr({"stroke-dashoffset":a}).animate({"stroke-dashoffset":0}, 300);
    }, 1400, mina.easeout);
    setTimeout(function() {
      setInterval(function() {
        c.animate({"stroke-dashoffset":-a}, 300);
      }, 1400, mina.easeout);
    }, 500);
  };
})(Entry.FieldIndicator.prototype);
Entry.Keyboard = {};
Entry.FieldKeyboard = function(a, b, c) {
  this._block = b.block;
  this._blockView = b;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = a.position;
  this._contents = a;
  this._index = c;
  this.setValue(String(this.getValue()));
  this._CONTENT_HEIGHT = this.getContentHeight();
  this._optionVisible = !1;
  this.renderStart(b);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldKeyboard);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text").attr({x:5, y:4, "font-size":"11px"});
    this.textElement.textContent = Entry.getKeyCodeMap()[this.getValue()];
    var a = this.getTextWidth() + 1, c = this._CONTENT_HEIGHT;
    this._header = this.svgGroup.elem("rect", {x:0, y:(this.position && this.position.y ? this.position.y : 0) - c / 2, width:a, height:c, rx:3, ry:3, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:a, height:c});
  };
  a.renderOptions = function() {
    Entry.keyPressed && (this.keyPressed = Entry.keyPressed.attach(this, this._keyboardControl));
    this._optionVisible = !0;
    this._attachDisposeEvent();
    var a = this.getAbsolutePosFromDocument();
    a.x -= this.box.width / 2;
    a.y += this.box.height / 2 + 1;
    this.optionGroup = Entry.Dom("img", {class:"entry-widget-keyboard-input", src:Entry.mediaFilePath + "/media/keyboard_workspace.png", parent:$("body")});
    this.optionGroup.css({left:a.x, top:a.y});
  };
  a.destroyOption = function() {
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.disposeEvent);
    this.optionGroup && (this.optionGroup.remove(), delete this.optionGroup);
    this._optionVisible = !1;
    this.command();
    this.keyPressed && (Entry.keyPressed.detach(this.keyPressed), delete this.keyPressed);
  };
  a._keyboardControl = function(a) {
    a.stopPropagation();
    if (this._optionVisible) {
      a = a.keyCode;
      var b = Entry.getKeyCodeMap()[a];
      void 0 !== b && this.applyValue(b, a);
    }
  };
  a.applyValue = function(a, c) {
    this.setValue(String(c));
    this.destroyOption();
    this.textElement.textContent = a;
    this.resize();
  };
  a.resize = function() {
    var a = this.getTextWidth() + 1;
    this._header.attr({width:a});
    this.box.set({width:a});
    this._blockView.alignContent();
  };
  a.getTextWidth = function() {
    return this.textElement.getComputedTextLength() + 10;
  };
  a.destroy = function() {
    this.destroyOption();
    Entry.keyPressed && this.keyPressed && Entry.keyPressed.detach(this.keyPressed);
  };
})(Entry.FieldKeyboard.prototype);
Entry.FieldLineBreak = function(a, b, c) {
  this._block = b.block;
  this._blockView = b;
  this._index = c;
  this.box = new Entry.BoxModel;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldLineBreak);
(function(a) {
  a.renderStart = function() {
  };
  a.align = function(a) {
    var b = this._blockView;
    0 !== b._statements.length && this.box.set({y:(b._statements[a].height || 20) + Math.max(b.contentHeight % 1E3, 30)});
  };
})(Entry.FieldLineBreak.prototype);
Entry.FieldOutput = function(a, b, c, d, e) {
  Entry.Model(this, !1);
  this._blockView = b;
  this._block = b.block;
  this._valueBlock = null;
  this.box = new Entry.BoxModel;
  this.changeEvent = new Entry.Event(this);
  this._index = c;
  this.contentIndex = e;
  this._content = a;
  this.acceptType = a.accept;
  this.view = this;
  this.svgGroup = null;
  this._position = a.position;
  this.box.observe(b, "alignContent", ["width", "height"]);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(b.getBoard(), d);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldOutput);
(function(a) {
  a.schema = {magneting:!1};
  a.renderStart = function(a, c) {
    this.svgGroup || (this.svgGroup = this._blockView.contentSvgGroup.elem("g"));
    this.view = this;
    this._nextGroup = this.svgGroup;
    this.box.set({x:0, y:0, width:0, height:20});
    var b = this.getValue();
    b && !b.view ? (b.setThread(this), b.createView(a, c)) : b && b.view && b.view.reDraw();
    this._updateValueBlock(b);
    this._blockView.getBoard().constructor == Entry.BlockMenu && this._valueBlock && this._valueBlock.view.removeControl();
  };
  a.align = function(a, c, d) {
    var b = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (c = this._position.y));
    var f = this._valueBlock;
    f && (c = -.5 * f.view.height);
    f = "translate(" + a + "," + c + ")";
    void 0 === d || d ? b.animate({transform:f}, 300, mina.easeinout) : b.attr({transform:f});
    this.box.set({x:a, y:c});
  };
  a.calcWH = function() {
    var a = this._valueBlock;
    a ? (a = a.view, this.box.set({width:a.width, height:a.height})) : this.box.set({width:0, height:20});
  };
  a.calcHeight = a.calcWH;
  a.destroy = function() {
  };
  a._inspectBlock = function() {
  };
  a._setValueBlock = function(a) {
    if (a != this._valueBlock || !this._valueBlock) {
      return this._valueBlock = a, this.setValue(a), a && a.setThread(this), this._valueBlock;
    }
  };
  a._updateValueBlock = function(a) {
    a instanceof Entry.Block || (a = void 0);
    a && a === this._valueBlock ? this.calcWH() : (this._sizeObserver && this._sizeObserver.destroy(), this._posObserver && this._posObserver.destroy(), (a = this._setValueBlock(a)) ? (a = a.view, a.bindPrev(), this._posObserver = a.observe(this, "_updateValueBlock", ["x", "y"], !1), this._sizeObserver = a.observe(this, "calcWH", ["width", "height"])) : this.calcWH(), this._blockView.alignContent());
  };
  a.getPrevBlock = function(a) {
    return this._valueBlock === a ? this : null;
  };
  a.getNextBlock = function() {
    return null;
  };
  a.requestAbsoluteCoordinate = function(a) {
    a = this._blockView;
    var b = a.contentPos;
    a = a.getAbsoluteCoordinate();
    a.x += this.box.x + b.x;
    a.y += this.box.y + b.y;
    return a;
  };
  a.dominate = function() {
    this._blockView.dominate();
  };
  a.isGlobal = function() {
    return !1;
  };
  a.separate = function(a) {
    this.getCode().createThread([a]);
    this.changeEvent.notify();
  };
  a.getCode = function() {
    return this._block.thread.getCode();
  };
  a.cut = function(a) {
    return this._valueBlock === a ? (delete this._valueBlock, [a]) : null;
  };
  a._updateBG = function() {
    this.magneting ? this._bg = this.svgGroup.elem("path", {d:"m -4,-12 h 3 l 2,2 0,3 3,0 1,1 0,12 -1,1 -3,0 0,3 -2,2 h -3 ", fill:"#fff", stroke:"#fff", "fill-opacity":.7, transform:"translate(0," + (this._valueBlock ? 12 : 0) + ")"}) : this._bg && (this._bg.remove(), delete this._bg);
  };
  a.replace = function(a) {
    var b = this._valueBlock;
    b && (b.view._toGlobalCoordinate(), a.getTerminateOutputBlock().view._contents[1].replace(b));
    this._updateValueBlock(a);
    a.view._toLocalCoordinate(this.svgGroup);
    this.calcWH();
  };
  a.setParent = function(a) {
    this._parent = a;
  };
  a.getParent = function() {
    return this._parent;
  };
  a.getThread = function() {
    return this;
  };
  a.getValueBlock = function() {
    return this._valueBlock;
  };
  a.pointer = function(a) {
    a.unshift(this._index);
    a.unshift(Entry.PARAM);
    return this._block.pointer(a);
  };
})(Entry.FieldOutput.prototype);
Entry.FieldStatement = function(a, b, c) {
  Entry.Model(this, !1);
  this._blockView = b;
  this.block = b.block;
  this.view = this;
  this._index = c;
  this.acceptType = a.accept;
  this._thread = this.statementSvgGroup = this.svgGroup = null;
  this._position = a.position;
  this._events = [];
  this.observe(b, "alignContent", ["height"], !1);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(b.getBoard());
};
(function(a) {
  a.schema = {x:0, y:0, width:100, height:20, magneting:!1};
  a.magnet = {next:{x:0, y:0}};
  a.renderStart = function(a) {
    this.svgGroup = this._blockView.statementSvgGroup.elem("g");
    this._nextGroup = this.statementSvgGroup = this.svgGroup.elem("g");
    this._initThread(a);
    this._board = a;
  };
  a._initThread = function(a) {
    var b = this.getValue();
    this._thread = b;
    b.createView(a);
    b.view.setParent(this);
    if (a = b.getFirstBlock()) {
      a.view._toLocalCoordinate(this.statementSvgGroup), this.firstBlock = a;
    }
    a = b.changeEvent.attach(this, this.calcHeight);
    var d = b.changeEvent.attach(this, this.checkTopBlock);
    this._events.push([b.changeEvent, a]);
    this._events.push([b.changeEvent, d]);
    this.calcHeight();
  };
  a.align = function(a, c, d) {
    d = void 0 === d ? !0 : d;
    var b = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (c = this._position.y));
    var f = "translate(" + a + "," + c + ")";
    this.set({x:a, y:c});
    d ? b.animate({transform:f}, 300, mina.easeinout) : b.attr({transform:f});
  };
  a.calcHeight = function() {
    var a = this._thread.view.requestPartHeight(null);
    this.set({height:a});
  };
  a.getValue = function() {
    return this.block.statements[this._index];
  };
  a.requestAbsoluteCoordinate = function() {
    var a = this._blockView.getAbsoluteCoordinate();
    a.x += this.x;
    a.y += this.y;
    return a;
  };
  a.dominate = function() {
    this._blockView.dominate();
  };
  a.destroy = function() {
    for (;this._events.length;) {
      var a = this._events.pop();
      a[0].detach(a[1]);
    }
  };
  a._updateBG = function() {
    if (this._board.dragBlock && this._board.dragBlock.dragInstance) {
      if (this.magneting) {
        var a = this._board.dragBlock.getShadow(), c = this.requestAbsoluteCoordinate(), c = "translate(" + c.x + "," + c.y + ")";
        $(a).attr({transform:c, display:"block"});
        this._clonedShadow = a;
        this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground);
        a = this._board.dragBlock.getBelowHeight();
        this.statementSvgGroup.attr({transform:"translate(0," + a + ")"});
        this.set({height:this.height + a});
      } else {
        this._clonedShadow && (this._clonedShadow.attr({display:"none"}), delete this._clonedShadow), a = this.originalHeight, void 0 !== a && (this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground), delete this.originalHeight), this.statementSvgGroup.attr({transform:"translate(0,0)"}), this.calcHeight();
      }
      (a = this.block.thread.changeEvent) && a.notify();
    }
  };
  a.insertTopBlock = function(a) {
    this._posObserver && this._posObserver.destroy();
    var b = this.firstBlock;
    (this.firstBlock = a) && a.doInsert(this._thread);
    return b;
  };
  a.getNextBlock = function() {
    return this.firstBlock;
  };
  a.checkTopBlock = function() {
    var a = this._thread.getFirstBlock();
    a && this.firstBlock !== a ? (this.firstBlock = a, a.view.bindPrev(this), a._updatePos()) : a || (this.firstBlock = null);
  };
})(Entry.FieldStatement.prototype);
Entry.FieldText = function(a, b, c) {
  this._block = b.block;
  this._blockView = b;
  this._index = c;
  this.box = new Entry.BoxModel;
  this._fontSize = a.fontSize || b.getSkeleton().fontSize || 12;
  this._color = a.color || this._block.getSchema().fontColor || b.getSkeleton().color || "white";
  this._align = a.align || "left";
  this._text = this.getValue() || a.text;
  this.setValue(null);
  this.textElement = null;
  this.renderStart(b);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldText);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._text = this._text.replace(/(\r\n|\n|\r)/gm, " ");
    this.textElement = this.svgGroup.elem("text").attr({style:"white-space: pre;", "font-size":this._fontSize + "px", "font-family":"nanumBarunRegular", "class":"dragNone", fill:this._color});
    this.textElement.textContent = this._text;
    var a = 0, c = this.textElement.getBoundingClientRect();
    "center" == this._align && (a = -c.width / 2);
    this.textElement.attr({x:a, y:.25 * c.height});
    this.box.set({x:0, y:0, width:c.width, height:c.height});
  };
})(Entry.FieldText.prototype);
Entry.FieldTextInput = function(a, b, c) {
  this._blockView = b;
  this._block = b.block;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = a.position;
  this._contents = a;
  this._index = c;
  this.value = this.getValue() || "";
  this._CONTENT_HEIGHT = this.getContentHeight();
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldTextInput);
(function(a) {
  a.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this.svgGroup.attr({class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text", {x:3, y:4, "font-size":"12px"});
    this.textElement.textContent = this.truncate();
    var a = this.getTextWidth(), c = this._CONTENT_HEIGHT;
    this._header = this.svgGroup.elem("rect", {width:a, height:c, y:(this.position && this.position.y ? this.position.y : 0) - c / 2, rx:3, ry:3, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:a, height:c});
  };
  a.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent(function() {
      a.applyValue();
      a.destroyOption();
    });
    this.optionGroup = Entry.Dom("input", {class:"entry-widget-input-field", parent:$("body")});
    this.optionGroup.val(this.getValue());
    this.optionGroup.on("mousedown", function(a) {
      a.stopPropagation();
    });
    this.optionGroup.on("keyup", function(b) {
      var c = b.keyCode || b.which;
      a.applyValue(b);
      -1 < [13, 27].indexOf(c) && a.destroyOption();
    });
    var c = this.getAbsolutePosFromDocument();
    c.y -= this.box.height / 2;
    this.optionGroup.css({height:this._CONTENT_HEIGHT, left:c.x, top:c.y, width:a.box.width});
    this.optionGroup.focus();
    c = this.optionGroup[0];
    c.setSelectionRange(0, c.value.length, "backward");
  };
  a.applyValue = function(a) {
    a = this.optionGroup.val();
    this.setValue(a);
    this.textElement.textContent = this.truncate();
    this.resize();
  };
  a.resize = function() {
    var a = this.getTextWidth();
    this._header.attr({width:a});
    this.optionGroup.css({width:a});
    this.box.set({width:a});
    this._blockView.alignContent();
  };
  a.getTextWidth = function() {
    return this.textElement.getBoundingClientRect().width + 6 + 2;
  };
})(Entry.FieldTextInput.prototype);
Entry.GlobalSvg = {};
(function(a) {
  a.DONE = 0;
  a._inited = !1;
  a.REMOVE = 1;
  a.RETURN = 2;
  a.createDom = function() {
    if (!this.inited) {
      $("#globalSvgSurface").remove();
      $("#globalSvg").remove();
      var a = $("body");
      this._container = Entry.Dom("div", {classes:["globalSvgSurface", "entryRemove"], id:"globalSvgSurface", parent:a});
      this.svgDom = Entry.Dom($('<svg id="globalSvg" width="10" height="10"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this._container});
      this.svg = Entry.SVG("globalSvg");
      this.top = this.left = 0;
      this._inited = !0;
    }
  };
  a.setView = function(a, c) {
    if (a != this._view && !a.block.isReadOnly() && a.movable) {
      return this._view = a, this._mode = c, c !== Entry.Workspace.MODE_VIMBOARD && a.set({visible:!1}), this.draw(), this.show(), this.align(), this.position(), !0;
    }
  };
  a.draw = function() {
    var a = this._view;
    this._svg && this.remove();
    var c = this._mode == Entry.Workspace.MODE_VIMBOARD;
    this.svgGroup = Entry.SVG.createElement(a.svgGroup.cloneNode(!0), {opacity:1});
    this.svg.appendChild(this.svgGroup);
    c && (a = $(this.svgGroup), a.find("g").css({filter:"none"}), a.find("path").velocity({opacity:0}, {duration:500}), a.find("text").velocity({fill:"#000000"}, {duration:530}));
  };
  a.remove = function() {
    this.svgGroup && (this.svgGroup.remove(), delete this.svgGroup, delete this._view, delete this._offsetX, delete this._offsetY, delete this._startX, delete this._startY, this.hide());
  };
  a.align = function() {
    var a = this._view.getSkeleton().box(this._view).offsetX || 0, c = this._view.getSkeleton().box(this._view).offsetY || 0, a = -1 * a + 1, c = -1 * c + 1;
    this._offsetX = a;
    this._offsetY = c;
    this.svgGroup.attr({transform:"translate(" + a + "," + c + ")"});
  };
  a.show = function() {
    this._container.removeClass("entryRemove");
  };
  a.hide = function() {
    this._container.addClass("entryRemove");
  };
  a.position = function() {
    var a = this._view;
    if (a) {
      var c = a.getAbsoluteCoordinate(), a = a.getBoard().offset();
      this.left = c.x + a.left - this._offsetX;
      this.top = c.y + a.top - this._offsetY;
      this.svgDom.css({transform:"translate3d(" + this.left + "px," + this.top + "px, 0px)"});
    }
  };
  a.terminateDrag = function(a) {
    var b = Entry.mouseCoordinate, d = a.getBoard(), e = d.workspace.blockMenu, f = e.offset().left, g = e.offset().top, h = e.visible ? e.svgDom.width() : 0;
    return b.y > d.offset().top - 20 && b.x > f + h ? this.DONE : b.y > g && b.x > f && e.visible ? a.block.isDeletable() ? this.REMOVE : this.RETURN : this.RETURN;
  };
  a.addControl = function(a) {
    this.onMouseDown.apply(this, arguments);
  };
  a.onMouseDown = function(a) {
    function b(a) {
      var b = a.pageX;
      a = a.pageY;
      var c = e.left + (b - e._startX), d = e.top + (a - e._startY);
      e.svgDom.css({transform:"translate3d(" + c + "px," + d + "px, 0px)"});
      e._startX = b;
      e._startY = a;
      e.left = c;
      e.top = d;
    }
    function d(a) {
      $(document).unbind(".block");
    }
    this._startY = a.pageY;
    var e = this;
    a.stopPropagation();
    a.preventDefault();
    var f = $(document);
    f.bind("mousemove.block", b);
    f.bind("mouseup.block", d);
    f.bind("touchmove.block", b);
    f.bind("touchend.block", d);
    this._startX = a.pageX;
    this._startY = a.pageY;
  };
})(Entry.GlobalSvg);
Entry.Mutator = function() {
};
(function(a) {
  a.mutate = function(a, c) {
    a = Entry.block[a];
    void 0 === a.changeEvent && (a.changeEvent = new Entry.Event);
    a.template = c.template;
    a.params = c.params;
    a.changeEvent.notify(1);
  };
})(Entry.Mutator);
(function(a) {
})(Entry.Mutator.prototype);
Entry.RenderView = function(a, b, c) {
  this._align = b || "CENTER";
  a = "string" === typeof a ? $("#" + a) : $(a);
  if ("DIV" !== a.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.view = a;
  this.viewOnly = !0;
  this.suffix = "renderView";
  this._scale = void 0 === c ? 1 : c;
  this.disableMouseEvent = this.visible = !0;
  this._svgId = "renderView_" + (new Date).getTime();
  this._generateView();
  this.offset = this.svgDom.offset();
  this._minBlockOffsetX = 0;
  this._setSize();
  this.svg = Entry.SVG(this._svgId, this.svgDom[0]);
  Entry.Utils.addFilters(this.svg, this.suffix);
  this.svg && (this.svgGroup = this.svg.elem("g"), this.svgThreadGroup = this.svgGroup.elem("g"), this.svgThreadGroup.board = this, this.svgBlockGroup = this.svgGroup.elem("g"), this.svgBlockGroup.board = this);
};
(function(a) {
  a.schema = {code:null, dragBlock:null, closeBlock:null, selectedBlockView:null};
  a._generateView = function() {
    this.renderViewContainer = Entry.Dom("div", {"class":"renderViewContainer", parent:this.view});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="renderView" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.renderViewContainer});
  };
  a.changeCode = function(a, c) {
    if (!(a instanceof Entry.Code)) {
      return console.error("You must inject code instance");
    }
    this.code = a;
    this.svg || (this.svg = Entry.SVG(this._svgId, this.svgDom[0]), this.svgGroup = this.svg.elem("g"), this.svgThreadGroup = this.svgGroup.elem("g"), this.svgThreadGroup.board = this, this.svgBlockGroup = this.svgGroup.elem("g"), this.svgBlockGroup.board = this);
    a.createView(this);
    this.align();
    this.resize(c);
  };
  a.align = function() {
    var a = this.code.getThreads();
    if (a && 0 !== a.length) {
      for (var c = 0, d = this._getHorizontalPadding(), e = 0, f = a.length;e < f;e++) {
        var g = a[e].getFirstBlock().view, h = g.svgGroup.getBBox().height, k = 0, m = $(g.svgGroup).find(".extension");
        if (m) {
          for (var l = 0;l < m.length;l++) {
            var n = parseFloat(m[l].getAttribute("x")), k = Math.min(k, n);
          }
        }
        this._minBlockOffsetX = Math.min(this._minBlockOffsetX, g.offsetX);
        g._moveTo(d - k - g.offsetX, c - g.offsetY, !1);
        c += h + 15;
      }
      this._setSize();
    }
  };
  a.hide = function() {
    this.view.addClass("entryRemove");
  };
  a.show = function() {
    this.view.removeClass("entryRemove");
  };
  a._setSize = function() {
    this.svgDom && (this._svgWidth = this.svgDom.width(), this.offset = this.svgDom.offset());
    this.svgGroup && (this._bBox = this.svgGroup.getBBox());
  };
  a.bindCodeView = function(a) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = a.svgBlockGroup;
    this.svgThreadGroup = a.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
  };
  a.resize = function(a) {
    function b() {
      this._setSize();
      var a = Math.round(this._bBox.width), b = Math.round(this._bBox.height);
      0 !== a && 0 !== b && ($(this.svg).css({width:a + this._getHorizontalPadding() - this._minBlockOffsetX, height:b + 5}), setTimeout(function() {
        var c = this.svgGroup.getBBox();
        Math.round(c.width) === a && Math.round(c.height) === b || this.resize();
      }.bind(this), 1E3));
    }
    this.svg && this._bBox && (a ? b.call(this) : setTimeout(function() {
      b.call(this);
    }.bind(this), 0));
  };
  a.setDomSize = function(a) {
    this.svgBlockGroup && this.svgBlockGroup.attr("transform", "scale(1)");
    this.code.view.reDraw();
    this.align();
    this.resize(a);
    1 !== this._scale && window.setTimeout(function() {
      this.svgBlockGroup.attr("transform", "scale(%scale)".replace("%scale", this._scale));
      this.align();
      this.resize();
    }.bind(this), 0);
  };
  a._getHorizontalPadding = function() {
    var a = {LEFT:20, LEFT_MOST:0}[this._align];
    return void 0 !== a ? a : this.svgDom.width() / 2;
  };
})(Entry.RenderView.prototype);
Entry.skinContainer = {_skins:{}};
(function(a) {
  a.skinSchema = {type:"", condition:[]};
  a.loadSkins = function(a) {
    a.map(this.addSkin.bind(this));
  };
  a.addSkin = function(a) {
    var b = function() {
    };
    b.prototype = Entry.block[a.type];
    var b = new b, d;
    for (d in a) {
      b[d] = a[d];
    }
    this._skins[a.type] || (this._skins[a.type] = []);
    this._skins[a.type].push(b);
  };
  a.getSkin = function(a) {
    if (this._skins[a.type]) {
      for (var b = this._skins[a.type], d = 0;d < b.length;d++) {
        var e = b[d];
        if (!e.conditions || !e.conditions.length) {
          return e;
        }
        for (var f = 0;f < e.conditions.length;f++) {
          var g = e.conditions[f];
          if (a.getDataByPointer(g.pointer) !== g.value) {
            break;
          }
          if (f === e.conditions.length - 1) {
            return e;
          }
        }
      }
    }
    return Entry.block[a.type];
  };
})(Entry.skinContainer);
Entry.ThreadView = function(a, b) {
  Entry.Model(this, !1);
  this.thread = a;
  this.svgGroup = b.svgThreadGroup.elem("g");
  this.parent = b;
  this._hasGuide = !1;
};
(function(a) {
  a.schema = {height:0, zIndex:0};
  a.destroy = function() {
    this.svgGroup.remove();
  };
  a.setParent = function(a) {
    this.parent = a;
  };
  a.getParent = function() {
    return this.parent;
  };
  a.renderText = function() {
    for (var a = this.thread.getBlocks(), c = 0;c < a.length;c++) {
      a[c].view.renderText();
    }
  };
  a.renderBlock = function() {
    for (var a = this.thread.getBlocks(), c = 0;c < a.length;c++) {
      a[c].view.renderBlock();
    }
  };
  a.requestAbsoluteCoordinate = function(a) {
    var b = this.thread.getBlocks(), d = b.shift(), e = {x:0, y:0};
    for (this.parent instanceof Entry.Board || this.parent instanceof Entry.BlockMenu || (e = this.parent.requestAbsoluteCoordinate());d && d.view !== a && d.view;) {
      d = d.view, e.x += d.x + d.magnet.next.x, e.y += d.y + d.magnet.next.y, d = b.shift();
    }
    return e;
  };
  a.requestPartHeight = function(a, c) {
    c = this.thread.getBlocks();
    for (var b = c.pop(), e = a ? a.magnet.next ? a.magnet.next.y : a.height : 0;b && b.view !== a && b.view;) {
      b = b.view, e = b.magnet.next ? e + b.magnet.next.y : e + b.height, b.dragMode === Entry.DRAG_MODE_DRAG && (e = 0), b = c.pop();
    }
    return e;
  };
  a.dominate = function() {
    !this._hasGuide && this.parent.dominate(this.thread);
  };
  a.isGlobal = function() {
    return this.parent instanceof Entry.Board;
  };
  a.reDraw = function() {
    for (var a = this.thread._data, c = a.length - 1;0 <= c;c--) {
      a[c].view.reDraw();
    }
  };
  a.setZIndex = function(a) {
    this.set({zIndex:a});
  };
  a.setHasGuide = function(a) {
    this._hasGuide = a;
  };
})(Entry.ThreadView.prototype);
Entry.Vim = function(a, b) {
  a = "string" === typeof a ? $("#" + a) : $(a);
  if ("DIV" !== a.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.createDom(a);
  this._mode = Entry.Vim.WORKSPACE_MODE;
  this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_PY;
  this._parser = new Entry.Parser(this._mode, this._parserType, this.codeMirror);
  Entry.Model(this, !1);
  window.eventset = [];
};
Entry.Vim.MAZE_MODE = 1;
Entry.Vim.WORKSPACE_MODE = 2;
Entry.Vim.TEXT_TYPE_JS = 0;
Entry.Vim.TEXT_TYPE_PY = 1;
Entry.Vim.PARSER_TYPE_JS_TO_BLOCK = 0;
Entry.Vim.PARSER_TYPE_PY_TO_BLOCK = 1;
Entry.Vim.PARSER_TYPE_BLOCK_TO_JS = 2;
Entry.Vim.PARSER_TYPE_BLOCK_TO_PY = 3;
Entry.Vim.PYTHON_IMPORT_ENTRY = "import Entry";
Entry.Vim.PYTHON_IMPORT_HW = "import Arduino, Hamster, Albert, Bitbrick, Codeino, Dplay \n\t   Neobot, Nemoino, Robotis, Sensorboard, Xbot from Hw";
(function(a) {
  a.createDom = function(a) {
    function b(a) {
      var b = e.getCodeToText(a.block);
      e.codeMirror.display.dragFunctions.leave(a);
      var c = Entry.Utils.createMouseEvent("mousedown", a);
      e.codeMirror.display.scroller.dispatchEvent(c);
      var b = b.split("\n"), d = b.length - 1, f = 0;
      b.forEach(function(a, b) {
        e.codeMirror.replaceSelection(a);
        f = e.doc.getCursor().line;
        e.codeMirror.indentLine(f);
        0 !== b && d === b || e.codeMirror.replaceSelection("\n");
      });
      a = Entry.Utils.createMouseEvent("mouseup", a);
      e.codeMirror.display.scroller.dispatchEvent(a);
    }
    function d(a) {
      e.codeMirror.display.dragFunctions.over(a);
    }
    var e;
    this.view = Entry.Dom("div", {parent:a, class:"entryVimBoard"});
    this.codeMirror = CodeMirror(this.view[0], {lineNumbers:!0, value:"", mode:{name:"javascript", globalVars:!0}, theme:"default", indentUnit:4, indentWithTabs:!0, styleActiveLine:!0, extraKeys:{"Ctrl-Space":"autocomplete"}, lint:!0, viewportMargin:10});
    this.doc = this.codeMirror.getDoc();
    e = this;
    a = this.view[0];
    a.removeEventListener("dragEnd", b);
    a.removeEventListener("dragOver", d);
    a.addEventListener("dragEnd", b);
    a.addEventListener("dragOver", d);
  };
  a.hide = function() {
    this.view.addClass("entryRemove");
  };
  a.show = function() {
    this.view.removeClass("entryRemove");
  };
  a.textToCode = function(a) {
    a === Entry.Vim.TEXT_TYPE_JS ? (this._parserType = Entry.Vim.PARSER_TYPE_JS_TO_BLOCK, this._parser.setParser(this._mode, this._parserType, this.codeMirror)) : a === Entry.Vim.TEXT_TYPE_PY && (this._parserType = Entry.Vim.PARSER_TYPE_PY_TO_BLOCK, this._parser.setParser(this._mode, this._parserType, this.codeMirror));
    a = this.codeMirror.getValue();
    return this._parser.parse(a);
  };
  a.codeToText = function(a, c) {
    var b;
    c && (this._mode = c.runType);
    Entry.playground && (b = Entry.playground.object, b = "# " + b.name + " \uc624\ube0c\uc81d\ud2b8\uc758 \ud30c\uc774\uc36c \ucf54\ub4dc");
    c = c.textType;
    c === Entry.Vim.TEXT_TYPE_JS ? (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_JS, this._parser.setParser(this._mode, this._parserType, this.codeMirror)) : c === Entry.Vim.TEXT_TYPE_PY && (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_PY, this._parser.setParser(this._mode, this._parserType, this.codeMirror));
    a = this._parser.parse(a, Entry.Parser.PARSE_GENERAL);
    c === Entry.Vim.TEXT_TYPE_PY && (a = b.concat("\n\n").concat(Entry.Vim.PYTHON_IMPORT_ENTRY).concat("\n\n").concat(a));
    this.codeMirror.setValue(a + "\n");
    c == Entry.Vim.TEXT_TYPE_PY && this.codeMirror.getDoc().markText({line:0, ch:0}, {line:4, ch:0}, {readOnly:!0});
    a = this.codeMirror.getDoc();
    a.setCursor({line:a.lastLine() - 1});
  };
  a.getCodeToText = function(a) {
    var b = this.workspace.oldTextType;
    b === Entry.Vim.TEXT_TYPE_JS ? (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_JS, this._parser.setParser(this._mode, this._parserType, this.codeMirror)) : b === Entry.Vim.TEXT_TYPE_PY && (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_PY, this._parser.setParser(this._mode, this._parserType, this.codeMirror));
    return this._parser.parse(a, Entry.Parser.PARSE_SYNTAX);
  };
  a.setParserAvailableCode = function(a, c) {
    this._parser.setAvailableCode(a, c);
  };
})(Entry.Vim.prototype);
Entry.Xml = {};
Entry.Xml.isTypeOf = function(a, b) {
  return b.getAttribute("type") == a;
};
Entry.Xml.getNextBlock = function(a) {
  a = a.childNodes;
  for (var b = 0;b < a.length;b++) {
    if ("NEXT" == a[b].tagName.toUpperCase()) {
      return a[b].children[0];
    }
  }
  return null;
};
Entry.Xml.getStatementBlock = function(a, b) {
  var c = b.getElementsByTagName("statement");
  if (!c.length) {
    return b;
  }
  for (var d in c) {
    if (c[d].getAttribute("name") == a) {
      return c[d].children[0];
    }
  }
  return null;
};
Entry.Xml.getParentLoop = function(a) {
  for (;;) {
    if (!a) {
      return null;
    }
    if ((a = a.parentNode) && "STATEMENT" == a.tagName.toUpperCase()) {
      return a.parentNode;
    }
    if (a) {
      a = a.parentNode;
    } else {
      return null;
    }
  }
};
Entry.Xml.getParentIterateLoop = function(a) {
  for (;;) {
    if (!a) {
      return null;
    }
    if ((a = a.parentNode) && a.getAttribute("type") && "REPEAT" == a.getAttribute("type").toUpperCase().substr(0, 6)) {
      return a;
    }
    if (!a) {
      return null;
    }
  }
};
Entry.Xml.getParentBlock = function(a) {
  return (a = a.parentNode) ? a.parentNode : null;
};
Entry.Xml.callReturn = function(a) {
  var b = Entry.Xml.getNextBlock(a);
  return b ? b : Entry.Xml.getParentLoop(a);
};
Entry.Xml.isRootBlock = function(a) {
};
Entry.Xml.getValue = function(a, b) {
  b = b.childNodes;
  if (!b.length) {
    return null;
  }
  for (var c in b) {
    if ("VALUE" == b[c].tagName.toUpperCase() && b[c].getAttribute("name") == a) {
      return b[c].children[0];
    }
  }
  return null;
};
Entry.Xml.getNumberValue = function(a, b, c) {
  c = c.childNodes;
  if (!c.length) {
    return null;
  }
  for (var d in c) {
    if (c[d].tagName && "VALUE" == c[d].tagName.toUpperCase() && c[d].getAttribute("name") == b) {
      return Number(Entry.Xml.operate(a, c[d].children[0]));
    }
  }
  return null;
};
Entry.Xml.getField = function(a, b) {
  b = b.childNodes;
  if (!b.length) {
    return null;
  }
  for (var c in b) {
    if (b[c].tagName && "FIELD" == b[c].tagName.toUpperCase() && b[c].getAttribute("name") == a) {
      return b[c].textContent;
    }
  }
};
Entry.Xml.getNumberField = function(a, b) {
  b = b.childNodes;
  if (!b.length) {
    return null;
  }
  for (var c in b) {
    if ("FIELD" == b[c].tagName.toUpperCase() && b[c].getAttribute("name") == a) {
      return Number(b[c].textContent);
    }
  }
};
Entry.Xml.getBooleanValue = function(a, b, c) {
  c = c.getElementsByTagName("value");
  if (!c.length) {
    return null;
  }
  for (var d in c) {
    if (c[d].getAttribute("name") == b) {
      return Entry.Xml.operate(a, c[d].children[0]);
    }
  }
  return null;
};
Entry.Xml.operate = function(a, b) {
  return Entry.block[b.getAttribute("type")](a, b);
};
Entry.Xml.cloneBlock = function(a, b, c) {
  var d = a.cloneNode();
  a.parentNode && "xml" != a.parentNode.tagName && Entry.Xml.cloneBlock(a.parentNode, d, "parent");
  for (var e = 0;e < a.childNodes.length;e++) {
    var f = a.childNodes[e];
    f instanceof Text ? d.textContent = f.textContent : "parent" == c ? d.appendChild(b) : d.appendChild(Entry.Xml.cloneBlock(f, d, "child"));
  }
  return d;
};
Entry.Youtube = function(a) {
  this.generateView(a);
};
p = Entry.Youtube.prototype;
p.init = function(a) {
  this.youtubeHash = a;
  this.generateView();
};
p.generateView = function(a) {
  var b = Entry.createElement("div");
  b.addClass("entryContainerMovieWorkspace");
  b.addClass("entryRemove");
  this.movieContainer = b;
  b = Entry.createElement("iframe");
  b.setAttribute("id", "youtubeIframe");
  b.setAttribute("allowfullscreen", "");
  b.setAttribute("frameborder", 0);
  b.setAttribute("src", "https://www.youtube.com/embed/" + a);
  this.movieFrame = b;
  this.movieContainer.appendChild(b);
};
p.getView = function() {
  return this.movieContainer;
};
p.resize = function() {
  var a = document.getElementsByClassName("propertyContent")[0], b = document.getElementById("youtubeIframe");
  w = a.offsetWidth;
  b.width = w + "px";
  b.height = 9 * w / 16 + "px";
};

