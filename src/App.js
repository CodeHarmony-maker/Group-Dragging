import React, { Component, createRef } from "react";
import Moveable from "react-moveable";
import Selecto from "react-selecto";

import "./styles.css";

import isDblTouchTap from "./isDblTouchTap";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      targets: [],
      targetState: "",
      groupButton: false,
      groupCount: [],
      groupEditing: true
    };
    this.moveableRef = createRef(null);
    this.selectoRef = createRef(null);
    this.frameMap = new Map();
  }

  get2DTransformValues = (el) => {
    if (el === undefined) {
      return;
    }
    let output = [];
    let valuess = el.style.transform.split(["rotate"]);
    valuess.forEach(function (item) {
      output.push(item.replace(/'/g, ""));
    });
    let transXSplit = output[0].split("(");
    let transX = transXSplit[1].split("px");
    let transY = transXSplit[2].split("px");
    let splitB = output[1].split("(");
    let Rotate = splitB[1].split("deg");
    let ScaleX = splitB[2].split(")");
    let ScaleY = splitB[3].split(")");
    return [
      parseInt(transX[0]),
      parseInt(transY[0]),
      parseFloat(Rotate[0]),
      parseInt(ScaleX[0]),
      parseInt(ScaleY[0])
    ];
  };
  handleOnClick = (e) => {
    let Target = e.target;
    if (
      Target.tagName === "path" ||
      Target.tagName === "rect" ||
      Target.tagName === "image" ||
      Target.tagName === "circle" ||
      Target.tagName === "polygon"
    ) {
      Target = e.target.closest("svg");
    }
    if (Target.dataset.target === undefined || Target.dataset.target === null) {
      return;
    }
    let BOX = Target.closest(".target");
    if (BOX.dataset.target === undefined) {
      return;
    }
    let regex = /\d+/g;
    let matches = parseInt(BOX.dataset.target.match(regex));
    const targets = [].slice.call(
      document.querySelectorAll(`[data-target="target${matches}"] span , 
        [data-target="target${matches}"] svg`)
    );
    this.setState({
      targets
    });
    if (this.state.targets.length > 1) {
      this.setState({
        groupButton: true
      });
    }
  };

  handleMakeGroup = () => {
    let MainGroup = document.getElementsByClassName("Group");
    let group_targetDIV = document.createElement("DIV");
    group_targetDIV.className = "target";
    for (let i = 0; i < this.state.targets.length; i++) {
      group_targetDIV.appendChild(this.state.targets[i].closest("div"));
    }
    MainGroup[0].appendChild(group_targetDIV);
    let newgroup = document.getElementsByClassName("Group")[0].childNodes;
    let getGroupElements = document.getElementsByClassName("Group")[0]
      .childNodes.length;
    for (let i = 0; i < getGroupElements; i++) {
      if (this.state.groupCount[i] !== i) {
        this.state.groupCount.push(i);
      }
      newgroup[i].dataset.target = `target${this.state.groupCount[i]}`;
    }
    MainGroup[0].addEventListener("click", (e) => {
      this.handleOnClick(e);
    });
    this.setState({
      groupButton: true
    });
  };
  handleUnGroup = () => {
    let TargetDiv = this.state.targets[0].closest(".target");
    let Target = document.querySelectorAll(
      `[data-target~="${TargetDiv.dataset.target}"]`
    );
    let MainRanderHTML = document.getElementsByClassName("randerHTML");
    let TargetChild = Target[0].childNodes;
    let TargetChildClone = [];

    let Tmp = MainRanderHTML[0].childNodes[1];
    let TmpClone = Tmp.cloneNode(true);
    for (let i = 0; i < TargetChild.length; i++) {
      TargetChildClone.push(TargetChild[i].cloneNode(true));
    }
    TargetDiv.remove();
    for (let j = 0; j < TargetChildClone.length; j++) {
      TmpClone.appendChild(TargetChildClone[j]);
    }
    MainRanderHTML[0].childNodes[1].replaceWith(TmpClone);
    this.setState({
      groupButton: false
    });
  };
  render() {
    return (
      <div
        onBlur={(e) => {
          this.setState({
            groupEditing: true
          });
        }}
      >
        <section className="Main">
          <div className="AREA">
            {this.state.groupButton === true &&
            !this.state.targets.length <= 0 ? (
              <button onClick={this.handleUnGroup} className="blue-btn">
                UnGroup
              </button>
            ) : (
              <button
                onClick={this.handleMakeGroup}
                className={
                  this.state.targets.length > 1 ? "green-btn" : "dsbl-btn"
                }
                disabled={this.state.targets.length <= 1 ? true : false}
              >
                Group
              </button>
            )}
            <div className="RM">
              <div className="RM-2">
                <Moveable
                  ref={this.moveableRef}
                  target={this.state.targets}
                  origin={false}
                  keepRatio={false}
                  draggable={true}
                  padding={{ left: 20, top: 20, right: 20, bottom: 20 }}
                  passDragArea={!this.state.groupEditing}
                  checkInput={!this.state.groupEditing}
                  // onClick={(e) => {
                  //   console.log("onClick", e);
                  //   let TARGET = e.inputTarget;
                  //   if (e.isDouble) {
                  //     TARGET.contentEditable = "true";
                  //     TARGET.focus();
                  //     this.setState({
                  //       groupEditing: false
                  //     });
                  //   }
                  //   if (!e.isDouble) {
                  //     this.setState({
                  //       groupEditing: true
                  //     });
                  //   }
                  // }}
                  onClickGroup={(e) => {
                    console.log("onClickGroup", e);
                    let TARGET = e.inputTarget;
                    this.selectoRef.current.clickTarget(
                      e.inputEvent,
                      e.inputTarget
                    );
                    // if (e.isDouble) {
                    //   // TARGET.contentEditable = "true";
                    //   // TARGET.focus();
                    //   this.setState({
                    //     groupEditing: true
                    //   });
                    // }
                    // if (!e.isDouble) {
                    //   this.setState({
                    //     groupEditing: true
                    //   });
                    // }
                  }}
                  onDragStart={(e) => {
                    const target = e.target;
                    let Transform = this.get2DTransformValues(target);
                    if (!this.frameMap.has(target)) {
                      this.frameMap.set(target, {
                        translate: [Transform[0], Transform[1]],
                        rotate: Transform[2]
                      });
                    }
                    const frame = this.frameMap.get(target);
                    e.set(frame.translate);
                  }}
                  onDrag={(e) => {
                    const target = e.target;
                    const frame = this.frameMap.get(target);
                    frame.translate = e.beforeTranslate;
                    target.style.transform = `translateX(${frame.translate[0]}px) translateY(${frame.translate[1]}px) rotate(${frame.rotate}deg) scaleX(1) scaleY(1)`;
                  }}
                  onDragGroupStart={(e) => {
                    e.events.forEach((ev) => {
                      const target = ev.target;
                      let Transform = this.get2DTransformValues(target);
                      if (!this.frameMap.has(target)) {
                        this.frameMap.set(target, {
                          translate: [Transform[0], Transform[1]],
                          rotate: Transform[2]
                        });
                      }
                      const frame = this.frameMap.get(target);
                      ev.set(frame.translate);
                    });
                  }}
                  onDragGroup={(e) => {
                    e.events.forEach((ev) => {
                      const target = ev.target;
                      const frame = this.frameMap.get(target);
                      frame.translate = ev.beforeTranslate;
                      target.style.transform = `translateX(${frame.translate[0]}px) translateY(${frame.translate[1]}px) rotate(${frame.rotate}deg) scaleX(1) scaleY(1)`;
                    });
                  }}
                  onDragGroupEnd={(e) => {}}
                />
                <Selecto
                  ref={this.selectoRef}
                  dragContainer={".RM"}
                  selectableTargets={[".selecto-area .cube"]}
                  hitRate={100}
                  selectByClick={false}
                  selectFromInside={true}
                  toggleContinueSelect={["shift"]}
                  onDragStart={(e) => {
                    this.setState({
                      groupEditing: true
                    });
                    const moveable = this.moveableRef.current;
                    const target = e.inputEvent.target;
                    if (
                      moveable.isMoveableElement(target) ||
                      this.state.targets.some(
                        (t) => t === target || t.contains(target)
                      )
                    ) {
                      e.stop();
                    }
                    const listitems = document.getElementsByClassName("txtcls");
                    for (let i = 0; i < listitems.length; i++) {
                      listitems[i].contentEditable = false;
                      listitems[i].style.cursor = "default";
                    }
                  }}
                  onSelect={(e) => {
                    if (e.selected.length === 0) {
                      return;
                    }
                    this.setState({
                      targets: e.selected
                    });
                    if (e.selected.length === 1) {
                      this.setState({
                        groupButton: false
                      });
                    }
                  }}
                  onSelectEnd={(e) => {
                    const moveable = this.moveableRef.current;
                    if (e.isDragStart) {
                      e.inputEvent.preventDefault();
                      setTimeout(() => {
                        moveable.dragStart(e.inputEvent);
                      });
                    }
                  }}
                ></Selecto>
                <div className="section-1">
                  <div className="loop">
                    <div style={{ transform: "scale(0.75)" }} className="PAGE">
                      <div
                        className="Group"
                        onClick={(e) => {
                          this.handleOnClick(e);
                          if (isDblTouchTap(e)) {
                            console.log("isDblTouchTap");
                            e.target.contentEditable = "true";
                            e.target.focus();
                          }
                        }}
                        // onTouchTap={(e) => {
                        //   if (isDblTouchTap(e)) {
                        //     // == onDblTouchTap
                        //     this.handleOnClick(e);
                        //     console.log("isDblTouchTap");
                        //   }
                        // }}
                      ></div>
                      <div
                        style={{
                          transform:
                            "translateX(0px) translateY(0px) rotate(0deg)"
                        }}
                        className="elements selecto-area"
                        id="selecto1"
                      >
                        <div>
                          <p>
                            <span
                              className="txtcls cube"
                              data-target="text_dtarget100"
                              style={{
                                transform:
                                  "translateX(-283.333px) translateY(78.3333px) rotate(0deg) scaleX(1) scaleY(1)",
                                position: "absolute",
                                fontSize: "100px",
                                fontFamily: "Bebas",
                                color: "rgb(5, 25, 43)",
                                cursor: "default"
                              }}
                            >
                              TEST LAYOUT
                            </span>
                          </p>
                        </div>
                        <div>
                          <p>
                            <span
                              className="txtcls cube"
                              data-target="text_dtarget102"
                              style={{
                                transform:
                                  "translateX(362.667px) translateY(377.333px) rotate(0deg) scaleX(1) scaleY(1)",
                                position: "absolute",
                                fontSize: "100px",
                                fontFamily: "Bebas",
                                color: "rgb(5, 25, 43)",
                                cursor: "default"
                              }}
                            >
                              CREATE DESIGN
                            </span>
                          </p>
                        </div>
                        <div>
                          <p>
                            <span
                              className="txtcls cube"
                              data-target="text_dtarget10442"
                              style={{
                                transform:
                                  "translateX(546px) translateY(566.333px) rotate(0deg) scaleX(1) scaleY(1)",
                                position: "absolute",
                                fontSize: "100px",
                                fontFamily: "Bebas",
                                color: "rgb(5, 25, 43)",
                                cursor: "default"
                              }}
                            >
                              New One
                            </span>
                          </p>
                        </div>
                        <div>
                          <p>
                            <span
                              className="txtcls cube"
                              data-target="text_dtarget10545442"
                              style={{
                                transform:
                                  "translateX(-102px) translateY(535.333px) rotate(0deg) scaleX(1) scaleY(1)",
                                position: "absolute",
                                fontSize: "100px",
                                fontFamily: "Bebas",
                                color: "rgb(5, 25, 43)",
                                cursor: "default"
                              }}
                            >
                              Task
                            </span>
                          </p>
                        </div>
                        <div>
                          <svg
                            className="cube"
                            xmlns="http://www.w3.org/2000/svg"
                            width="120"
                            height="110"
                            viewBox="0 0 120 110"
                            data-name="svgcls"
                            data-target="svg_targetK1594797996157"
                            style={{
                              transform:
                                "translateX(100px) translateY(284px) rotate(0deg) scaleX(1) scaleY(1)",
                              position: "absolute"
                            }}
                          >
                            <path
                              id="shape6"
                              d="M1047.018,4.969A36.1,36.1,0,0,0,1020,17.521,36.092,36.092,0,0,0,992.983,4.969,32.48,32.48,0,0,0,960,37.831c0,22.74,20.39,41.284,51.595,68.787l8.405,8.35,8.411-8.35c31.2-27.5,51.589-46.047,51.589-68.787A32.481,32.481,0,0,0,1047.018,4.969Z"
                              transform="translate(-960 -4.969)"
                              fill="#e6e6e6"
                              style={{ fill: "rgb(255, 112, 106)" }}
                            />
                          </svg>
                        </div>
                        <div>
                          <svg
                            className="cube"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 30.9 40.9"
                            data-target="svg_dtarget4"
                            data-name="svgcls"
                            style={{
                              width: "31px",
                              height: "41px",
                              transform:
                                "translateX(529.667px) translateY(14.3333px) rotate(0deg) scaleX(1) scaleY(1)",
                              position: "absolute"
                            }}
                          >
                            <title>sim_2_4</title>
                            <g id="Layer_2" data-name="Layer 2">
                              <g id="Layer_2-2" data-name="Layer 2">
                                <path
                                  d="M13.6,39.9a2.2,2.2,0,0,0,1.8,1h0a2.2,2.2,0,0,0,1.8-1L28.5,23.6h.1A15.3,15.3,0,0,0,29,8,15.2,15.2,0,0,0,15.8,0h-.9a15.1,15.1,0,0,0-13,8.1,15.4,15.4,0,0,0,.4,15.5ZM4.5,9.5A12.4,12.4,0,0,1,15,3h.8A12.1,12.1,0,0,1,26.3,9.5,12,12,0,0,1,26,21.9L15.4,37.3,4.8,21.9A12.5,12.5,0,0,1,4.5,9.5Z"
                                  style={{ fill: "#ff00f7" }}
                                ></path>
                                <path
                                  d="M15.4,21.7A6.7,6.7,0,1,0,8.7,15,6.7,6.7,0,0,0,15.4,21.7Zm0-10.4A3.7,3.7,0,1,1,11.7,15,3.7,3.7,0,0,1,15.4,11.3Z"
                                  style={{ fill: "#ff00f7" }}
                                ></path>
                              </g>
                            </g>
                          </svg>
                        </div>
                        <div>
                          <svg
                            className="cube"
                            xmlns="http://www.w3.org/2000/svg"
                            width="120"
                            height="120"
                            viewBox="0 0 120 120"
                            data-name="svgcls"
                            data-target="svg_targetU1597044198283"
                            style={{
                              transform:
                                "translateX(922px) translateY(124.667px) rotate(0deg) scaleX(1) scaleY(1)",
                              position: "absolute"
                            }}
                          >
                            <rect
                              id="shape3"
                              width="120"
                              height="120"
                              rx="15"
                              fill="#9b4aec85"
                            ></rect>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default App;
