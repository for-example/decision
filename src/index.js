/* eslint-disable no-eval */
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const tabs = ['Alternatives','Criteria','Compare Criteria','Compare Alternatives','Result'];
const options =['9','7','5','3','1','1/3','1/5','1/7','1/9']

function Tab(props) {
  let classNames = [];
  props.current && classNames.push("selected");
  props.completed && classNames.push("completed");

  return (
    <button className={classNames.join(' ')} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function Tabs(props) {
  function renderTab(tab, current, completed) {
    return (
      <Tab
        value={tab}
        key={tab}
        current={current}
        completed={completed}
        onClick={() => props.onClick(tab)}
      />
    );
  }

  return (
    <div className="tabRow">
      { props.values.map((value) =>
        renderTab(
          value,
          value === props.current,
          props.completedStatus[value]
        ))
      }
    </div>
  );
}

function ListControl(props) {
  const [input, setInput] = useState('');
  return (
    <>
      {props.title}
      <ul>
        {
          props.list &&
          props.list.map((value) => {
            return(
              <li key={value}>
                {value}
                <button
                  className="editButton"
                  onClick={() => props.onDelete(value)}>
                  x
                </button>
              </li>
            )
          })
        }
        <li>
          <input value={input} onInput={e => setInput(e.target.value)}/>
          <button
            className="editButton"
            onClick={() => {input !== '' && props.onAdd(input); setInput('');}}>
            New
          </button>
        </li>
      </ul>
    </>
  );
}

function Alternatives(props) {
  return (
    <div>
      <ListControl
        title='Alternatives'
        list={props.list}
        onDelete={(value) => props.onDeleteAlternative(value)}
        onAdd={(value) => props.onAddAlternative(value)}
      />
    </div>
  );

}

class Criteria extends React.Component {
  render() {
    return (
      <div>
        <ListControl
          title='Criteria'
          list={this.props.list}
          onDelete={(value) => this.props.onDeleteCriterion(value)}
          onAdd={(value) => this.props.onAddCriterion(value)}
        />
      </div>
    );
  }
}

function CompareCriteria(props) {
  function radioRow(key, value, criterion1, criterion2) {
    return(
      <tr key={key}>
       <th>{criterion1}</th>
       <td>
        {options.map((opt) => {
          return(
            <span key={opt}>
              <input
                className="compareRadio"
                type="radio"
                value={opt}
                checked={opt === value}
                name={key}
                onChange={(e) => props.onSetCompareCriteria(key,e.currentTarget.value)}
              />
              {opt.replace('1/','')}
            </span>
          )}
        )}
        </td>
        <th>{criterion2}</th>
      </tr>
    )
  }
  return (
    <>
      Compare Criteria
      <table>
        <tbody>{
          props.data &&
          Object.keys(props.data).map((key) => {
            const [i, j] = key.split('_')
            return(
              radioRow(key, props.data[key], props.criteria[i], props.criteria[j])
            )
          })
        }
        </tbody>
      </table>
    </>
  );
}

function CompareAlternatives(props) {
  function radioRow(key, value, alternative1, alternative2) {
    return(
      <tr key={key}>
        <th>{alternative1}</th>
        <td>
          {options.map((opt) => {
            return(
              <span key={opt}>
                <input
                  className="compareRadio"
                  type="radio"
                  value={opt}
                  checked={opt === value}
                  name={key}
                  onChange={(e) => props.onSetCompareAlternatives(key,e.currentTarget.value)}
                />
                {opt.replace('1/','')}
              </span>
            )}
          )}
        </td>
        <th>{alternative2}</th>
      </tr>
    )
  }
  return (
    <>
      Compare Alternatives
      <table>
        <tbody>{
          props.data &&
          Object.keys(props.data).map((key) => {
            const [k, i, j] = key.split('_')
            return(
              <React.Fragment key={key}>
                <tr>
                  <td className="noborder"></td>
                  <th className="noborder">{props.criteria[k]}</th>
                  <td className="noborder"></td>
                </tr>
                {radioRow(key, props.data[key], props.alternatives[i], props.alternatives[j])}
                <tr>
                  <td className="noborder"></td>
                </tr>
              </React.Fragment>
            )
          })
        }
        </tbody>
      </table>
    </>
  );
}

function Result(props) {
  const {criteria, alternatives, compare_criteria, compare_alternatives} = props.data

  const criteria_vector = (normalize(eigenvector(compare_criteria_matrix(criteria,compare_criteria))))

  let alternatives_matrix =[]
  for (let i = 0; i < criteria.length; i++) {
    alternatives_matrix[i] = (normalize(eigenvector(compare_alternatives_matrix(alternatives,compare_alternatives,i))))
  }

  var result_vector = []
  alternatives.forEach((aitem, i) => {
    let sum = 0;
    criteria.forEach((citem, j) => {
      sum += criteria_vector[j] * alternatives_matrix[j][i];
    });
    result_vector.push(sum);
  });
  result_vector = normalize(result_vector);

  return (
    <table>
      <tbody>
        <tr>
          <td className="noborder"></td>
          {criteria.map((value) => <th key={value}>{value}</th>)}
        </tr>
        <tr>
          <td className="noborder"></td>
          {criteria_vector.map((value, ind) => <td key={ind}>{Math.round(value*100)/100}</td>)}
        </tr>
        <tr><td className="noborder"></td></tr>

        <tr>
          <td className="noborder"></td>
          {criteria.map((value) => <th key={value}>{value}</th>)}
          <td className="noborder"></td>
          <td className="noborder"></td>
          <th>result</th>
        </tr>

        {alternatives.map((alt, aindex) => {
          return (
          <tr key={alt}>
            <th>{alt}</th>
            {criteria.map((value, cindex) => <td key={value}>{Math.round(alternatives_matrix[cindex][aindex]*100)/100}</td>)}
            <td className="noborder"></td>
            <th>{alt}</th>
            <td>{Math.round(result_vector[aindex]*100)/100}</td>
          </tr>
          )
        })}
      </tbody>
    </table>
  );
}
//-------- internal functions
function normalize(ar) {
  const sum =
    ar.reduce((sum,value) => {
      return(sum + value)
    })
  if (sum !== 0) {
    ar = ar.map((item) => item / sum);
  }
  return(ar);
}

function compare_criteria_matrix(criteria,compare_criteria) {
  let out = [];
  for (let i = 0; i < criteria.length; i++) {
    out[i] = [];
    for (let j = 0; j < criteria.length; j++) {
      if (i === j) {
        out[i][j] = 1;
      } else if (compare_criteria[i+'_'+j] !== undefined){
        out[i][j] = eval(compare_criteria[i+'_'+j]);
      } else {
        out[i][j] = 1/out[j][i];
      }
    }
  }
  return out;
}

function compare_alternatives_matrix(alternatives,compare_alternatives, c) {
  let out = [];
  for (let i = 0; i < alternatives.length; i++) {
    out[i] = [];
    for (let j = 0; j < alternatives.length; j++) {
      if (i === j) {
        out[i][j] = 1;
      } else if (compare_alternatives[c+'_'+i+'_'+j] !== undefined){
        out[i][j] = eval(compare_alternatives[c+'_'+i+'_'+j]);
      } else {
        out[i][j] = 1/out[j][i];
      }
    }
  }
  return out;
}

function eigenvector(matrix) {
  let out = [];
  for (let i = 0; i < matrix.length; i++) {
    out[i] = 1;
    for (let j = 0; j < matrix.length; j++) {
      out[i] *= matrix[i][j];
    }
    out[i] = Math.pow(out[i], 1/matrix.length);
  }
  return out;
}


//---------

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 'Alternatives',
      alternatives: [],
      criteria: [],
      compare_criteria: {},
      compare_alternatives: {}
    };
  }

  completedStatus() {
    const status = {
      'Alternatives': this.state.alternatives.length > 1,
      'Criteria': this.state.criteria.length > 1,
      'Compare Criteria':
        Object.keys(this.state.compare_criteria).length > 0 &&
        Object.values(this.state.compare_criteria).reduce((sum,value) => {
          return(sum && value)
        }),
      'Compare Alternatives':
        Object.keys(this.state.compare_alternatives).length > 0 &&
        Object.values(this.state.compare_alternatives).reduce((sum,value) => {
          return(sum && value)
        }),
    }

    const resultStatus = Object.values(status).reduce((sum,value) => {
      return(sum && value)
    });

    return (
      { ...status, 'Result': resultStatus}
    )
  }

  prepCompareCriteria() {
    let out = {};
    const cri = this.state.criteria;
    for (let i = 0; i < cri.length; i++) {
      for (let j = i+1; j < cri.length; j++) {
        out[`${i}_${j}`] = null;
      }
    }
    this.setState({compare_criteria: out})
    this.prepCompareAlternatives()
  }

  prepCompareAlternatives() {
    let out = {}
    const cri = this.state.criteria;
    const alt = this.state.alternatives;
    for (let k = 0; k < cri.length; k++) {
      for (let i = 0; i < alt.length; i++) {
        for (let j = i+1; j < alt.length; j++) {
          out[`${k}_${i}_${j}`] = null;
        }
      }
    }
    this.setState({compare_alternatives: out})
  }

  handleAddAlternative(value) {
    if (!this.state.alternatives.includes(value)) {
      const newArray = [...this.state.alternatives, value];
      this.setState({alternatives: newArray}, () => this.prepCompareAlternatives());
    }
  }

  handleDeleteAlternative(value) {
    const filteredArray = this.state.alternatives.filter(item => item !== value)
    this.setState({alternatives: filteredArray}, () => this.prepCompareAlternatives());
  }

  handleAddCriterion(value) {
    if (!this.state.criteria.includes(value)) {
      const newArray = [...this.state.criteria, value]
      this.setState({criteria: newArray}, () => this.prepCompareCriteria());
    }
  }

  handleDeleteCriterion(value) {
    const filteredArray = this.state.criteria.filter(item => item !== value)
    this.setState({criteria: filteredArray}, () => this.prepCompareCriteria());
  }

  handleSetCompareCriteria(key,value) {
    let cc = this.state.compare_criteria
    cc[key] = value
    this.setState({compare_criteria: cc})
  }

  handleSetCompareAlternatives(key,value) {
    let ca = this.state.compare_alternatives
    ca[key] = value
    this.setState({compare_alternatives: ca})
  }

  handleTabClick(tab) {
    this.setState({
      currentTab: tab
    })
  }

  render() {
    return (
      <div className="main">
        <Tabs
          values={tabs}
          current={this.state.currentTab}
          completedStatus={this.completedStatus()}
          onClick={(tab) => this.handleTabClick(tab)}
        />
        {
          this.state.currentTab === 'Alternatives' &&
          <Alternatives
            list={this.state.alternatives}
            onDeleteAlternative={(value) => this.handleDeleteAlternative(value)}
            onAddAlternative={(value) => this.handleAddAlternative(value)}
          />
        }
        {
          this.state.currentTab === 'Criteria' &&
          <Criteria
            list={this.state.criteria}
            onDeleteCriterion={(value) => this.handleDeleteCriterion(value)}
            onAddCriterion={(value) => this.handleAddCriterion(value)}
          />
        }
        {
          this.state.currentTab === 'Compare Criteria' &&
          <CompareCriteria
            criteria={this.state.criteria}
            data={this.state.compare_criteria}
            onSetCompareCriteria={(key,value) => this.handleSetCompareCriteria(key, value)}
          />
        }
        {
          this.state.currentTab === 'Compare Alternatives' &&
          <CompareAlternatives
            criteria={this.state.criteria}
            alternatives={this.state.alternatives}
            data={this.state.compare_alternatives}
            onSetCompareAlternatives={(key,value) => this.handleSetCompareAlternatives(key, value)}
          />
        }
        {
          this.state.currentTab === 'Result' &&
          <Result
            data={this.state}
          />
        }

      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Main />,
  document.getElementById('root')
);
