// src/utils/lamport.js

export class LWWRegister {
  constructor(nodeId, initialValue = null, initialTime = 0) {
    this.nodeId = nodeId;
    this.value = initialValue;
    this.time = initialTime;
  }

  set(value, timeOverride = null) {
    this.time = timeOverride !== null ? timeOverride : this.time + 1;
    this.value = value;
    return { value: this.value, time: this.time, nodeId: this.nodeId };
  }

  merge(remoteState) {
    if (!remoteState) return;
    const { value: rValue, time: rTime, nodeId: rNodeId } = remoteState;
    
    // LWW resolution: 
    // If remote time is greater, or times are equal and remote nodeId is lexically greater
    if (rTime > this.time || (rTime === this.time && rNodeId > this.nodeId)) {
      this.value = rValue;
      this.nodeId = rNodeId; // keep the winning node's ID to preserve state correctly
    }
    
    // Update local clock to max of both
    this.time = Math.max(this.time, rTime);
  }

  getState() {
    return { value: this.value, time: this.time, nodeId: this.nodeId };
  }
}

// Map of item -> LWWRegister
export class LWWMap {
  constructor(nodeId) {
    this.nodeId = nodeId;
    this.data = new Map(); // key -> LWWRegister
  }

  get(key) {
    const reg = this.data.get(key);
    return reg ? reg.value : undefined;
  }

  set(key, value) {
    let reg = this.data.get(key);
    if (!reg) {
      reg = new LWWRegister(this.nodeId);
      this.data.set(key, reg);
    }
    return reg.set(value);
  }

  merge(key, remoteState) {
    let reg = this.data.get(key);
    if (!reg) {
      reg = new LWWRegister(this.nodeId);
      this.data.set(key, reg);
    }
    reg.merge(remoteState);
  }

  mergeAll(remoteStates) {
    for (const [key, state] of Object.entries(remoteStates)) {
      this.merge(key, state);
    }
  }
  
  export() {
    const res = {};
    for (const [key, reg] of this.data.entries()) {
      res[key] = reg.getState();
    }
    return res;
  }
  
  exportValues() {
    const res = {};
    for (const [key, reg] of this.data.entries()) {
      res[key] = reg.value;
    }
    return res;
  }
}
