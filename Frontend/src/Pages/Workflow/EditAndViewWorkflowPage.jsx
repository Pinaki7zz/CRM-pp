import React, { useState } from 'react';
import './EditAndViewWorkflowPage.css';

const EditAndViewWorkflowPage = () => {
  const [businessObject, setBusinessObject] = useState({
    objectType: '',
    name: '',
    description: '',
    timing: ''
  });

  const [conditions, setConditions] = useState([{
    field: 'immediate',
    compareOperator: 'Equal to',
    with: 'Value',
    value: 'immediate'
  }]);

  const [actions, setActions] = useState({
    ruleType: 'Field Update',
    cancellationTask: ''
  });

  const handleSave = () => {
    console.log('Saving workflow...', { businessObject, conditions, actions });
  };

  const handleExit = () => {
    console.log('Exiting workflow...');
  };

  const handleAddCondition = () => {
    setConditions([...conditions, {
      field: 'immediate',
      compareOperator: 'Equal to',
      with: 'Value',
      value: ''
    }]);
  };

  return (
    <div className="workflow-container">
      <div className="workflow-header">
        <h1 className="workflow-title">Workflow</h1>
        <div className="workflow-actions">
          <button className="btn btn-save" onClick={handleSave}>Save</button>
          <button className="btn btn-exit" onClick={handleExit}>Exit</button>
        </div>
      </div>

      <div className="workflow-content">
        {/* Business Object Section */}
        <section className="section">
          <h2 className="section-title">Business Object</h2>
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="objectType">Object Type</label>
                <select 
                  id="objectType"
                  value={businessObject.objectType}
                  onChange={(e) => setBusinessObject({...businessObject, objectType: e.target.value})}
                >
                  <option value=""></option>
                  <option value="account">Account</option>
                  <option value="contact">Contact</option>
                  <option value="opportunity">Opportunity</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input 
                  type="text" 
                  id="name"
                  value={businessObject.name}
                  onChange={(e) => setBusinessObject({...businessObject, name: e.target.value})}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input 
                  type="text" 
                  id="description"
                  value={businessObject.description}
                  onChange={(e) => setBusinessObject({...businessObject, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="timing">Timing</label>
                <select 
                  id="timing"
                  value={businessObject.timing}
                  onChange={(e) => setBusinessObject({...businessObject, timing: e.target.value})}
                >
                  <option value=""></option>
                  <option value="immediate">Immediate</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>
            <div className="required-note">* = Required Fields</div>
          </div>
        </section>

        {/* Conditions Section */}
        <section className="section">
          <h2 className="section-title">Conditions</h2>
          <div className="section-content">
            <div className="conditions-header">
              <span>Execute if the following</span>
              <select className="conditions-logic">
                <option value="all">conditions are met ▼</option>
                <option value="any">any condition is met</option>
              </select>
              <button className="btn-add" onClick={handleAddCondition}>Add</button>
            </div>
            
            {conditions.map((condition, index) => (
              <div key={index} className="condition-row">
                <div className="form-group-inline">
                  <label>Field</label>
                  <select 
                    value={condition.field}
                    onChange={(e) => {
                      const newConditions = [...conditions];
                      newConditions[index].field = e.target.value;
                      setConditions(newConditions);
                    }}
                  >
                    <option value="immediate">immediate</option>
                    <option value="status">status</option>
                    <option value="priority">priority</option>
                  </select>
                </div>
                <div className="form-group-inline">
                  <label>Compare Operator</label>
                  <select 
                    value={condition.compareOperator}
                    onChange={(e) => {
                      const newConditions = [...conditions];
                      newConditions[index].compareOperator = e.target.value;
                      setConditions(newConditions);
                    }}
                  >
                    <option value="Equal to">Equal to</option>
                    <option value="Not equal to">Not equal to</option>
                    <option value="Greater than">Greater than</option>
                    <option value="Less than">Less than</option>
                  </select>
                </div>
                <div className="form-group-inline">
                  <label>With</label>
                  <select 
                    value={condition.with}
                    onChange={(e) => {
                      const newConditions = [...conditions];
                      newConditions[index].with = e.target.value;
                      setConditions(newConditions);
                    }}
                  >
                    <option value="Value">Value</option>
                    <option value="Field">Field</option>
                  </select>
                </div>
                <input 
                  type="text" 
                  className="condition-value"
                  value={condition.value}
                  onChange={(e) => {
                    const newConditions = [...conditions];
                    newConditions[index].value = e.target.value;
                    setConditions(newConditions);
                  }}
                />
              </div>
            ))}
            <div className="required-note">* = Required Fields</div>
          </div>
        </section>

        {/* Actions Section */}
        <section className="section">
          <h2 className="section-title">Actions</h2>
          <div className="section-content">
            <div className="form-group">
              <label htmlFor="ruleType">Rule Type</label>
              <select 
                id="ruleType"
                value={actions.ruleType}
                onChange={(e) => setActions({...actions, ruleType: e.target.value})}
              >
                <option value="Field Update">Field Update</option>
                <option value="Email Alert">Email Alert</option>
                <option value="Task">Task</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="cancellationTask">Cancellation of task</label>
              <select 
                id="cancellationTask"
                value={actions.cancellationTask}
                onChange={(e) => setActions({...actions, cancellationTask: e.target.value})}
              >
                <option value=""></option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="businessRole">Business Role - Determination</label>
              <input 
                type="text" 
                id="businessRole"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EditAndViewWorkflowPage;