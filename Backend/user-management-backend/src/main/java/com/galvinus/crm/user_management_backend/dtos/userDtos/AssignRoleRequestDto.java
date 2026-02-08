// File: src/main/java/com/galvinus/crm/user_management_backend/dtos/userDtos/AssignRoleRequestDto.java
package com.galvinus.crm.user_management_backend.dtos.userDtos;

import java.util.List;

public class AssignRoleRequestDto {
    // Change to String to handle JSON parsing safely
    private List<String> ids;
    private String roleId;

    public AssignRoleRequestDto() {}

    public List<String> getIds() { return ids; }
    public void setIds(List<String> ids) { this.ids = ids; }

    public String getRoleId() { return roleId; }
    public void setRoleId(String roleId) { this.roleId = roleId; }
    
    @Override
    public String toString() {
        return "AssignRoleRequestDto{ids=" + ids + ", roleId='" + roleId + "'}";
    }
}