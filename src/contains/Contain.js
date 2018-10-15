import React, { Component } from 'react';
import '../Style.css';

const axios = require('axios');
const url = "http://localhost:3000";
class Contain extends Component {
  state = {
    parents: [],
    students: [],
    activeParent: 0,
    search: [],
    notes: "",
    postForm: []

  }

  getParent(){
    axios.get(`${url}/parents`)
      .then(res => {
        this.setState({parents: res.data});
        this.setState({search: res.data});
      });
  }

  getChildren(){
    axios.get(`${url}/students`)
      .then(res => this.setState({students: res.data}));
  }

  componentWillMount(){ 
    this.getParent();
    this.getChildren();
  }

  setActiveParent(e, id){
    this.setState({activeParent: e});
  }
  
  addForm(){
    this.setState({postForm: this.state.postForm.concat([{'id': this.state.postForm.length+1, 'name': ''}]) });
  }

  saveInput(id, value){
    
    const postArr = [...this.state.postForm];
    postArr[id-1]['name'] = value.target.value;
    this.setState({postForm: postArr})
    
  }

  saveInfo(){
    this.state.postForm.map(
      person => {
        let id = this.state.students.length + 1;
        axios.post(`${url}/students`, {
          'id' : id,
          'name': person.name,
          'parentId': this.state.activeParent
        });

        axios.patch(`${url}/parents/`+this.state.activeParent, {
          'enrolled' : true
        });
      }
    );    
  }

  filterParent(event){
    const value = event.target.value;
    let parent = this.state.parents;
    parent = parent.filter(function(person){
      return person.name.toString().toLowerCase().search(
        value.toString().toLowerCase()) !== -1;
    });
    this.setState({search: parent});
  }

  render() {
    console.log(this.state);
    return (
      <div>
          <Search handleInputs={this.filterParent.bind(this)}/>
          <Table data={this.state.search} handleClick={this.setActiveParent.bind(this)}/>
          <Single parent={this.state.search} student={this.state.students} selected={this.state.activeParent} handleClick={this.addForm.bind(this)}/>
          {this.state.postForm.map(item=>(
            <div key={item.id}>
              <StudentForm id={item.id} handleClick={this.addInfo} handleInputs={this.saveInput.bind(this)}/>
            </div>
          ))}
          {this.state.postForm.length === 0 ? '' : <button onClick={this.saveInfo.bind(this)}>Save Student(s)</button>}
      </div>
    );
  }
}

const Search = (props) => <input className="input-search" placeholder="Search.." onKeyPress={props.handleInputs.bind(this)}></input>;

const StudentForm = (props) => (
  <div>    
    <table className="table-parent">
      <tbody>
        <tr>
          <td>Student #{props.id}:</td>
          <td><input className="input-student" placeholder="Input text here..." onChange={props.handleInputs.bind(this, props.id)}></input></td>
        </tr>
      </tbody>
    </table>
  </div>
);

const Table = (props) => (
  <div>
    <table className="table-table">
      <tbody>
      {props.data.map(parent => (
        <tr key={parent.id}>
          <td>{parent.name}</td>
          <td>{parent.enrolled ? 'Enrolled' : 'Pre'}</td>
          <td><button onClick={props.handleClick.bind(null,parent.id)}>Click..</button></td>
        </tr>     
      ))}
      </tbody>
    </table>
  </div>
);

const Single = (props) => (
    <div>
      <br/> 
      <table className="table-parent">
          {props.parent.map((item)=>{
              if(item.id === props.selected){
                return (
                <thead>
                  <tr key={item.id}>
                    <td>Parent:</td>
                    <td>{item.name}</td>
                  </tr>
                  <tr>
                    <td>Enrolled:</td>
                    <td>{item.enrolled === true ? 'yes' : <button onClick={props.handleClick}>Add Form</button>}</td>
                  </tr>
                </thead>
                )
              }
            })}        
        <tbody>
            {props.student.map((child)=> {
              if (child.parentId === props.selected){
                return(
                <tr key={child.id}>
                  <td>Student:</td>
                  <td>{child.name}</td>
                </tr>)
              }
            })}
        </tbody>  
      </table>
    </div>
);


export default Contain;
