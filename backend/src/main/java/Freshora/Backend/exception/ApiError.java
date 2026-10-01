package Freshora.Backend.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    private final String timestamp;
    private final int status;
    private final String error;
    private final String code;
    private final String message;
    private final String path;
    private final Map<String, String> fieldErrors;
    private final String requestId;

    public ApiError(Instant timestamp, int status, String error, String code, String message,
                    String path, Map<String, String> fieldErrors, String requestId) {
        this.timestamp = timestamp == null ? null : timestamp.toString();
        this.status = status;
        this.error = error;
        this.code = code;
        this.message = message;
        this.path = path;
        this.fieldErrors = fieldErrors;
        this.requestId = requestId;
    }

    public String getTimestamp() { return timestamp; }
    public int getStatus() { return status; }
    public String getError() { return error; }
    public String getCode() { return code; }
    public String getMessage() { return message; }
    public String getPath() { return path; }
    public Map<String, String> getFieldErrors() { return fieldErrors; }
    public String getRequestId() { return requestId; }
}
