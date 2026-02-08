package crm.workflow.workflowservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Data
public class Action {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Rule Type is mandatory")
    private String ruleType;

    @NotBlank(message = "Cancel is mandatory")
    private String cancel;

    @NotBlank(message = "User Determination is mandatory")
    private String userDetermination;

    @NotBlank(message = "Business Role Determination is mandatory")
    @Size(max = 50, message = "Business Role Determination must be less than 50 characters")
    private String businessRoleDetermination;
}