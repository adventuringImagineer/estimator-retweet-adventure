// JavaScript API to utilize Estimator.

// An object interfacing with an Estimator.
class Estimator extends fpgaServer {
  // Constructor.
  // Params:
  //   websocket_url: The URL of the 1st CLaaS websocket to which to connect.
  //   cb: A callback for Estimates returned by Estimator.sendObjects(..) of the form cb(estimate, info),
  //       where:
  //          estimate: The Estimate response from the Estimator of the form....TBD.
  //          info: As provided in sendObjects(..).
  //   ready_cb: (opt) Callback for websocket ready or set of callbacks as in fpgaServer constructor (without onmessage).
  constructor(websocket_url, cb, ready_cb) {
    super();
    this.wsCb = cb;

    // A structure of pending Objects (sent but not received) indexed by `${object.cnt}:${object.prob}:${object.rid}`.
    this.pendingObjects = {};

    // If ready_cb is a raw function, bundle it as an object of callbacks (either form is permitted as input).
    function isFunction(functionToCheck) {
      return (
        functionToCheck &&
        {}.toString.call(functionToCheck) === "[object Function]"
      );
    }
    if (isFunction(ready_cb)) {
      ready_cb = { onopen: ready_cb };
    }

    // Provide onmessage callback.
    ready_cb.onmessage = (msg) => {
      try {
        // console.log('msg.data: ', msg.data);
        // console.log(typeof msg.data);
        let data = JSON.parse(msg.data);
        // console.log(typeof data);
        // console.log('data: ', data);
        if (data.hasOwnProperty("type")) {
          console.log(`Received message: ${data.type}`);
        } else {
          // Response.
          // console.log('data.length: ', data.length);
          let last_obj = data[data.length - 1];
          // console.log('last_obj:', last_obj);
          // Look up pendingObjects.
          let obj_index = "";
          try {
            obj_index = `${last_obj.cnt}:${last_obj.prob}:${last_obj.rid}`;
          } catch (e) {
            console.log(
              "Estimator response Object does not contain proper properties."
            );
            debugger;
          }
          let orig_obj = this.pendingObjects[obj_index];
          // console.log('orig_obj: ', orig_obj);
          if (typeof orig_obj === "undefined") {
            console.log(
              `Estimator response Object (${obj_index}) is not pending.`
            );
            debugger;
          }
          // // console.log('before this.wsCb', data);
          // try {
          this.wsCb(data, orig_obj);
          // } catch (err) {
          //   // console.log('this.wsCb error: ', err)
          // }
          // // console.log('after this.wsCb', data);
        }
      } catch (err) {
          console.log(`Failed to parse returned json string: ${err}`);
        // console.log(`Failed to parse returned json string: ${msg.data}`);
      }
    };

    // Create websocket.
    // console.log('before connectUrl');
    this.connectURL(websocket_url, ready_cb);
    // console.log('after connectUrl');
  }

  // Send objects to the estimator.
  // Params:
  //   objects: The Objects to send to the estimator, to be converted to JSON and passed to the microservice in the "payload" property.
  //   info: (opt) Additional information associated with these objects passed to callback.
  sendObjects(objects, info) {
    // console.log('in sendObjects');
    // console.log('in estimator objects: ', objects)
    // console.log('info: ', info)
    // Record this batch of objects as pending.
    //
    let obj_index = "";
    try {
      // console.log('in try');
      let last_obj = objects[objects.length - 1];
      // console.log('last obj: ', last_obj);
      obj_index = `${last_obj.cnt}:${last_obj.prob}:${last_obj.rid}`;
      // console.log('obj index: ', obj_index);
    } catch (e) {
      console.log(
        "Objects for sendObjects(..) must contain properties: 'cnt' (0-65535), 'prob' (true/false), and 'rid' (0-127). Cannot send."
      );
      debugger;
    }
    if (typeof this.pendingObjects[obj_index] !== "undefined") {
      console.log(
        `Sending an object that conflicts with the pending object: ${obj_index}`
      );
      debugger;
    }
    // console.log('before pendingObjects');
    this.pendingObjects[obj_index] = info;
    // console.log('after pendingObjects');
    // Send to Estimator microservice.
    try {
    this.send("OBJECT", objects);
    }
    catch (err){
      // console.log('Error on this.send: ', err);
    }
    // console.log('after this.send');
  }
}

