package crm.workflow.workflowservice.repository;

import crm.workflow.workflowservice.entity.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    // Add custom queries if required
}
