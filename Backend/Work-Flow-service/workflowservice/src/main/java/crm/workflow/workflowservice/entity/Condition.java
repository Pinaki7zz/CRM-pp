 

package crm.workflow.workflowservice.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Data
@Table(name = "conditions")
public class Condition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Field is mandatory")
    @Size(max = 50, message = "Field must be less than 50 characters")
    private String field;

    @NotBlank(message = "Operator is mandatory")
    private String operator;

    @NotBlank(message = "Value is mandatory")
    @Size(max = 100, message = "Value must be less than 100 characters")
    private String value;

    @ManyToOne
    @JoinColumn(name = "group_id")
    @JsonBackReference("conditionGroup-condition") // prevents recursion with ConditionGroup
    private ConditionGroup conditionGroup;
}
