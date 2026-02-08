 
package crm.workflow.workflowservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Workflow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is mandatory")
    @Size(max = 100, message = "Name must be less than 100 characters")
    private String name;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    @NotBlank(message = "Business Object is mandatory")
    private String businessObject;

    @NotBlank(message = "Timing is mandatory")
    private String timing;

    @NotBlank(message = "Condition Logic is mandatory")
    private String conditionLogic;

    @NotNull(message = "Condition Groups cannot be null")
    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("workflow-conditionGroup")
    private List<ConditionGroup> conditionGroups = new ArrayList<>();

    @NotNull(message = "Action is mandatory")
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "action_id", referencedColumnName = "id")
    private Action action;
}
