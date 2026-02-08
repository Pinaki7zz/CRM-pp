 

package crm.workflow.workflowservice.controller;

import crm.workflow.workflowservice.entity.Condition;
import crm.workflow.workflowservice.entity.ConditionGroup;
import crm.workflow.workflowservice.entity.Workflow;
import crm.workflow.workflowservice.exception.WorkflowException;
import crm.workflow.workflowservice.exception.WorkflowNotFoundException;
import crm.workflow.workflowservice.service.WorkflowService;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {

    @Autowired
    private WorkflowService workflowService;

    @GetMapping
    public ResponseEntity<List<Workflow>> getAllWorkflows() {
        List<Workflow> list = workflowService.getAllWorkflows();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workflow> getWorkflowById(@PathVariable Long id) {
        try {
            Optional<Workflow> workflow = workflowService.getWorkflowById(id);
            return workflow.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<Workflow> createWorkflow(@Valid @RequestBody Workflow workflow) {
        try {
            Workflow savedWorkflow = workflowService.saveWorkflow(workflow);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedWorkflow);
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (WorkflowException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workflow> updateWorkflow(@PathVariable Long id, @Valid @RequestBody Workflow workflowDetails) {
        try {
            Optional<Workflow> optionalWorkflow = workflowService.getWorkflowById(id);
            if (optionalWorkflow.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Workflow workflow = optionalWorkflow.get();

            // Update scalar fields
            workflow.setName(workflowDetails.getName());
            workflow.setDescription(workflowDetails.getDescription());
            workflow.setBusinessObject(workflowDetails.getBusinessObject());
            workflow.setTiming(workflowDetails.getTiming());
            workflow.setConditionLogic(workflowDetails.getConditionLogic());
            workflow.setAction(workflowDetails.getAction());

            // Replace and re-wire condition groups and conditions
            workflow.getConditionGroups().clear();
            if (workflowDetails.getConditionGroups() != null) {
                for (ConditionGroup group : workflowDetails.getConditionGroups()) {
                    group.setWorkflow(workflow);
                    if (group.getConditions() != null) {
                        for (Condition condition : group.getConditions()) {
                            condition.setConditionGroup(group);
                        }
                    }
                    workflow.getConditionGroups().add(group);
                }
            }

            Workflow updatedWorkflow = workflowService.saveWorkflow(workflow);
            return ResponseEntity.ok(updatedWorkflow);
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (WorkflowException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable Long id) {
        try {
            workflowService.deleteWorkflow(id);
            return ResponseEntity.noContent().build();
        } catch (WorkflowNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (WorkflowException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
