 

package crm.workflow.workflowservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Data
public class ConditionGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "workflow_id")
    @JsonBackReference("workflow-conditionGroup") // prevents recursion with Workflow
    private Workflow workflow;

    @NotNull(message = "Conditions cannot be null")
    @OneToMany(mappedBy = "conditionGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("conditionGroup-condition") // manages Condition list
    private List<Condition> conditions = new ArrayList<>();
}
