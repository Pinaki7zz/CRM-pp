 



package crm.workflow.workflowservice.service;

import crm.workflow.workflowservice.entity.Action;
import crm.workflow.workflowservice.entity.Condition;
import crm.workflow.workflowservice.entity.ConditionGroup;
import crm.workflow.workflowservice.entity.Workflow;
import crm.workflow.workflowservice.exception.WorkflowException;
import crm.workflow.workflowservice.exception.WorkflowNotFoundException;
import crm.workflow.workflowservice.repository.WorkflowRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class WorkflowService {

    @Autowired
    private WorkflowRepository workflowRepository;

    @Autowired
    private Validator validator;

    public List<Workflow> getAllWorkflows() {
        Iterable<Workflow> iterable = workflowRepository.findAll();
        List<Workflow> list = new java.util.ArrayList<>();
        iterable.forEach(list::add);
        return list;
    }

    public Optional<Workflow> getWorkflowById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid workflow ID");
        }
        return workflowRepository.findById(id);
    }

    @Transactional
    public Workflow saveWorkflow(Workflow workflow) {
        validateWorkflow(workflow);

        // Set back references for persistence cascades
        List<ConditionGroup> groups = extractConditionGroups(workflow);
        if (groups != null) {
            for (ConditionGroup group : groups) {
                group.setWorkflow(workflow);
                if (group.getConditions() != null) {
                    for (Condition condition : group.getConditions()) {
                        condition.setConditionGroup(group);
                    }
                }
            }
        }

        try {
            return workflowRepository.save(workflow);
        } catch (Exception e) {
            throw new WorkflowException("Failed to save workflow: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteWorkflow(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid workflow ID");
        }
        if (!workflowRepository.existsById(id)) {
            throw new WorkflowNotFoundException("Workflow with ID " + id + " not found");
        }
        try {
            workflowRepository.deleteById(id);
        } catch (Exception e) {
            throw new WorkflowException("Failed to delete workflow: " + e.getMessage(), e);
        }
    }

    private void validateWorkflow(Workflow workflow) {
        if (workflow == null) {
            throw new IllegalArgumentException("Workflow cannot be null");
        }
        Set<ConstraintViolation<Workflow>> violations = validator.validate(workflow);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        // Validate nested objects (ConditionGroup, Condition, Action)
        List<ConditionGroup> groups = extractConditionGroups(workflow);
        if (groups != null) {
            for (ConditionGroup group : groups) {
                Set<ConstraintViolation<ConditionGroup>> groupViolations = validator.validate(group);
                if (!groupViolations.isEmpty()) {
                    throw new ConstraintViolationException(groupViolations);
                }
                if (group.getConditions() != null) {
                    for (Condition condition : group.getConditions()) {
                        Set<ConstraintViolation<Condition>> conditionViolations = validator.validate(condition);
                        if (!conditionViolations.isEmpty()) {
                            throw new ConstraintViolationException(conditionViolations);
                        }
                    }
                }
            }
        }

        if (workflow.getAction() != null) {
            Set<ConstraintViolation<Action>> actionViolations = validator.validate(workflow.getAction());
            if (!actionViolations.isEmpty()) {
                throw new ConstraintViolationException(actionViolations);
            }
        }
    }

    // Helper to safely obtain condition groups when Workflow may not expose a getter.
    @SuppressWarnings("unchecked")
    private List<ConditionGroup> extractConditionGroups(Workflow workflow) {
        if (workflow == null) {
            return null;
        }
        try {
            java.lang.reflect.Method m = workflow.getClass().getMethod("getConditionGroups");
            Object result = m.invoke(workflow);
            if (result instanceof List) {
                return (List<ConditionGroup>) result;
            }
        } catch (NoSuchMethodException nsme) {
            // fall through to field access
        } catch (Exception ignore) {
            // reflection invocation failed
            return null;
        }
        try {
            java.lang.reflect.Field f = workflow.getClass().getDeclaredField("conditionGroups");
            f.setAccessible(true);
            Object result = f.get(workflow);
            if (result instanceof List) {
                return (List<ConditionGroup>) result;
            }
        } catch (Exception ignore) {
            // Can't access field - return null
        }
        return null;
    }
}
