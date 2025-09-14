import * as React from "react";
import Select, { StylesConfig, MultiValue, SingleValue, CSSObjectWithLabel, ControlProps, OptionProps } from "react-select";
import { Plus, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  fcmToken?: string;
}

interface NotificationFormData {
  title: string;
  body: string;
  priority: "high" | "medium" | "low";
  tokens: string[];
  sendPush: boolean;
  sendEmail: boolean;
}

interface FormErrors {
  title?: string;
  body?: string;
  priority?: string;
  tokens?: string;
  notificationType?: string;
  sendPush?: string;
  sendEmail?: string;
}

interface PriorityOption {
  value: "high" | "medium" | "low";
  label: string;
  badge: BadgeProps["variant"];
}

interface UserOption {
  value: string;
  label: string;
  isSelectAll?: boolean;
}

interface AddNotificationSheetProps {
  onNotificationAdded?: () => void;
}

const priorityOptions: PriorityOption[] = [
  { value: "high", label: "High Priority", badge: "destructive" },
  { value: "medium", label: "Medium Priority", badge: "default" },
  { value: "low", label: "Low Priority", badge: "secondary" },
];

export default function AddNotificationSheet({
  onNotificationAdded,
}: AddNotificationSheetProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);
  const [formData, setFormData] = React.useState<NotificationFormData>({
    title: "",
    body: "",
    priority: "medium",
    tokens: [],
    sendPush: true,
    sendEmail: true,
  });
  const [errors, setErrors] = React.useState<FormErrors>({});

  // Priority select styles (single-select)
  const prioritySelectStyles: StylesConfig<PriorityOption, false> = {
    control: (base: CSSObjectWithLabel, state: ControlProps<PriorityOption, false>) => ({
      ...base,
      borderColor: errors.priority
        ? "hsl(var(--destructive))"
        : "hsl(var(--border))",
      backgroundColor: "#ffffff",
      "&:hover": {
        borderColor: errors.priority
          ? "hsl(var(--destructive))"
          : "hsl(var(--primary)/0.7)",
      },
      boxShadow: state.isFocused ? "0 0 0 2px hsl(var(--primary)/0.3)" : "none",
      borderRadius: "0.5rem",
      padding: "0.25rem",
      transition: "all 0.3s ease-in-out",
    }),
    menu: (base: CSSObjectWithLabel) => ({
      ...base,
      backgroundColor: "#ffffff",
      border: "1px solid hsl(var(--border))",
      borderRadius: "0.5rem",
      boxShadow: "0 8px 24px hsl(var(--shadow)/0.15)",
      marginTop: "0.5rem",
    }),
    option: (base: CSSObjectWithLabel, state: OptionProps<PriorityOption, false>) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "hsl(var(--primary)/0.1)"
        : state.isFocused
        ? "hsl(var(--primary)/0.05)"
        : "#ffffff",
      color: "hsl(var(--foreground))",
      padding: "0.75rem 1rem",
      "&:active": {
        backgroundColor: "hsl(var(--primary)/0.15)",
      },
      transition: "background-color 0.3s ease-in-out",
    }),
    placeholder: (base: CSSObjectWithLabel) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
      fontSize: "0.875rem",
    }),
  };

  // User select styles (multi-select)
  const userSelectStyles: StylesConfig<UserOption, true> = {
    control: (base: CSSObjectWithLabel, state: ControlProps<UserOption, true>) => ({
      ...base,
      borderColor: errors.tokens
        ? "hsl(var(--destructive))"
        : "hsl(var(--border))",
      backgroundColor: "#ffffff",
      "&:hover": {
        borderColor: errors.tokens
          ? "hsl(var(--destructive))"
          : "hsl(var(--primary)/0.7)",
      },
      boxShadow: state.isFocused ? "0 0 0 2px hsl(var(--primary)/0.3)" : "none",
      borderRadius: "0.5rem",
      padding: "0.25rem",
      transition: "all 0.3s ease-in-out",
    }),
    menu: (base: CSSObjectWithLabel) => ({
      ...base,
      backgroundColor: "#ffffff",
      border: "1px solid hsl(var(--border))",
      borderRadius: "0.5rem",
      boxShadow: "0 8px 24px hsl(var(--shadow)/0.15)",
      marginTop: "0.5rem",
    }),
    option: (base: CSSObjectWithLabel, state: OptionProps<UserOption, true>) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "hsl(var(--primary)/0.1)"
        : state.isFocused
        ? "hsl(var(--primary)/0.05)"
        : "#ffffff",
      color: "hsl(var(--foreground))",
      padding: "0.75rem 1rem",
      "&:active": {
        backgroundColor: "hsl(var(--primary)/0.15)",
      },
      transition: "background-color 0.3s ease-in-out",
    }),
    placeholder: (base: CSSObjectWithLabel) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
      fontSize: "0.875rem",
    }),
    multiValue: (base: CSSObjectWithLabel) => ({
      ...base,
      backgroundColor: "hsl(var(--primary)/0.1)",
      borderRadius: "0.375rem",
      padding: "0.25rem",
    }),
    multiValueLabel: (base: CSSObjectWithLabel) => ({
      ...base,
      color: "hsl(var(--foreground))",
      fontSize: "0.875rem",
    }),
    multiValueRemove: (base: CSSObjectWithLabel) => ({
      ...base,
      "&:hover": {
        backgroundColor: "hsl(var(--destructive)/0.2)",
        color: "hsl(var(--destructive))",
        borderRadius: "0.25rem",
      },
    }),
  };

  // Fetch users from API
  React.useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await fetch("/api/GET/user-management/approvedUsers");
        const result = await response.json();
        console.log("Fetched users:", result);
        if (result.success) {
          setUsers(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users", { duration: 3000 });
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be 100 characters or less";
    }

    if (!formData.body.trim()) {
      newErrors.body = "Message body is required";
    } else if (formData.body.length > 500) {
      newErrors.body = "Message must be 500 characters or less";
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }

    if (formData.tokens.length === 0) {
      newErrors.tokens = "At least one recipient is required";
    }

    if (!formData.sendPush && !formData.sendEmail) {
      newErrors.notificationType = "At least one notification type (Push or Email) must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: "",
      body: "",
      priority: "medium",
      tokens: [],
      sendPush: true,
      sendEmail: true,
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let pushSuccess = false;
      let emailSuccess = false;

      // Send push notification if enabled
      if (formData.sendPush) {
        const pushPayload = {
          title: formData.title,
          body: formData.body,
          priority: formData.priority,
          tokens: formData.tokens,
          timestamp: {
            _seconds: Math.floor(Date.now() / 1000),
            _nanoseconds: (Date.now() % 1000) * 1000000,
          },
        };

        const pushResponse = await fetch("/api/POST/pushnotifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pushPayload),
        });

        if (!pushResponse.ok) {
          const errorData = await pushResponse.json().catch(() => ({
            message: "Unknown error",
          }));
          throw new Error(`Push notification error: ${errorData.message || `HTTP error! status: ${pushResponse.status}`}`);
        }

        await pushResponse.json();
        pushSuccess = true;
        toast.success("Push notification sent successfully!", {
          duration: 3000,
          position: "top-right",
        });
      }

      // Send email notifications if enabled
      if (formData.sendEmail) {
        const emailResults = [];
        const emailErrors = [];

        // Process emails individually to continue on failures
        for (const token of formData.tokens) {
          const user = users.find((u) => u.fcmToken === token);
          if (!user || !user.email) {
            console.warn(`No email found for token: ${token}`);
            emailErrors.push({ email: token, message: "No email found for this user" });
            continue;
          }

          try {
            const emailPayload = {
              title: formData.title,
              message: formData.body,
              email: user.email,
            };

            const emailResponse = await fetch("/api/POST/sendEmailNOtifications", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(emailPayload),
            });

            if (!emailResponse.ok) {
              const errorData = await emailResponse.json().catch(() => ({
                message: "Unknown error",
              }));
              emailErrors.push({
                email: user.email,
                message: errorData.message || `HTTP error! status: ${emailResponse.status}`
              });
              continue;
            }

            emailResults.push({ email: user.email });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            emailErrors.push({ email: user.email, message: errorMessage });
          }
        }

        // Show results
        if (emailResults.length > 0) {
          emailSuccess = true;
          if (emailErrors.length === 0) {
            toast.success("All email notifications sent successfully!", {
              duration: 3000,
              position: "top-right",
            });
          } else {
            toast.success(`${emailResults.length} email notifications sent successfully! ${emailErrors.length} failed.`, {
              duration: 4000,
              position: "top-right",
            });
          }
        }

        if (emailErrors.length > 0) {
          console.warn("Email notification errors:", emailErrors);
        }
      }

      // Only reset and close if at least one notification type was sent successfully
      if (pushSuccess || emailSuccess) {
        resetForm();
        setOpen(false);
        if (onNotificationAdded) {
          onNotificationAdded();
        }
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send notifications",
        { duration: 3000, position: "top-right" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof NotificationFormData,
    value: string | string[] | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear notificationType error when toggling
    if ((field === "sendPush" || field === "sendEmail") && errors.notificationType) {
      setErrors((prev) => ({ ...prev, notificationType: undefined }));
    }
  };

  const getPriorityColor = (priority: string): BadgeProps["variant"] => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      resetForm();
    }
    setOpen(newOpen);
  };

  // Get valid users (those with FCM tokens)
  const validUsers = users.filter((user) => user.fcmToken && user.fcmToken.trim() !== "");

  const userOptions: UserOption[] = [
    { value: "all", label: "Select All Users", isSelectAll: true },
    ...validUsers.map((user) => ({
      value: user.fcmToken!,
      label: `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.email,
      isSelectAll: false,
    })),
  ];

  const handleUserSelection = (selectedOptions: MultiValue<UserOption>) => {
    const selectedArray = Array.from(selectedOptions);
    
    // Check if "Select All" was selected
    const selectAllChosen = selectedArray.some(option => option.isSelectAll);
    
    if (selectAllChosen) {
      // If "Select All" is chosen, select all valid user tokens
      const allTokens = validUsers.map(user => user.fcmToken!);
      handleInputChange("tokens", allTokens);
    } else {
      // Regular selection - filter out any "Select All" option and get tokens
      const tokens = selectedArray
        .filter(option => !option.isSelectAll)
        .map(option => option.value);
      handleInputChange("tokens", tokens);
    }
  };

  const handlePriorityChange = (selectedOption: SingleValue<PriorityOption>) => {
    handleInputChange("priority", selectedOption?.value || "medium");
  };

  const getSelectedUserOptions = (): UserOption[] => {
    // If all users are selected, show "Select All"
    const allValidTokens = validUsers.map(user => user.fcmToken!);
    const areAllSelected = formData.tokens.length === allValidTokens.length && 
                          allValidTokens.every(token => formData.tokens.includes(token));
    
    if (areAllSelected) {
      return [userOptions[0]]; // Return "Select All" option
    }
    
    // Otherwise, return individual selected users
    return userOptions.filter(option => 
      !option.isSelectAll && formData.tokens.includes(option.value)
    );
  };

  // Determine notification type text for preview
  const getNotificationTypeText = () => {
    if (formData.sendPush && formData.sendEmail) {
      return "via push and email";
    } else if (formData.sendPush) {
      return "via push";
    } else if (formData.sendEmail) {
      return "via email";
    }
    return "";
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          className="bg-[#0997be] hover:bg-[#0997be] text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
          variant="default"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Notification
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[45vw] max-w-[600px] min-w-[400px] bg-background rounded-l-xl shadow-2xl p-6"
        side="right"
      >
        <div className="h-full flex flex-col">
          <SheetHeader className="border-b pb-4 mb-6">
            <SheetTitle className="text-2xl font-semibold text-foreground">
              Send Notification
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-sm">
              Create and send notifications to selected users via push, email, or both
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 px-1 custom-scrollbar">
            <div className="grid gap-6">
              {/* Notification Type Selection */}
              <div className="grid gap-2">
                <Label className="text-sm font-medium text-foreground">
                  Notification Type <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendPush"
                      checked={formData.sendPush}
                      onCheckedChange={(checked) => handleInputChange("sendPush", checked)}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="sendPush" className="text-sm text-foreground">
                      Send Push Notification
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendEmail"
                      checked={formData.sendEmail}
                      onCheckedChange={(checked) => handleInputChange("sendEmail", checked)}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="sendEmail" className="text-sm text-foreground">
                      Send Email Notification
                    </Label>
                  </div>
                </div>
                {errors.notificationType && (
                  <p className="text-sm text-destructive">{errors.notificationType}</p>
                )}
              </div>

              {/* Title Field */}
              <div className="grid gap-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-foreground"
                >
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter notification title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`transition-all duration-300 rounded-lg border-2 ${
                    errors.title ? "border-destructive" : "border-border"
                  } focus:ring-2 focus:ring-primary/50 bg-background hover:bg-muted/20`}
                  maxLength={100}
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Body Field */}
              <div className="grid gap-2">
                <Label
                  htmlFor="body"
                  className="text-sm font-medium text-foreground"
                >
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="body"
                  placeholder="Enter notification message"
                  value={formData.body}
                  onChange={(e) => handleInputChange("body", e.target.value)}
                  className={`transition-all duration-300 rounded-lg border-2 ${
                    errors.body ? "border-destructive" : "border-border"
                  } focus:ring-2 focus:ring-primary/50 bg-background hover:bg-muted/20 resize-none`}
                  rows={5}
                  maxLength={500}
                  disabled={isSubmitting}
                />
                {errors.body && (
                  <p className="text-sm text-destructive">{errors.body}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.body.length}/500 characters
                </p>
              </div>

              {/* Priority Field */}
              <div className="grid gap-2">
                <Label
                  htmlFor="priority"
                  className="text-sm font-medium text-foreground"
                >
                  Priority <span className="text-destructive">*</span>
                </Label>
                <Select<PriorityOption, false>
                  name="priority"
                  options={priorityOptions}
                  value={priorityOptions.find(
                    (option) => option.value === formData.priority
                  )}
                  onChange={handlePriorityChange}
                  placeholder="Select priority"
                  isDisabled={isSubmitting}
                  styles={prioritySelectStyles}
                  formatOptionLabel={(option) => (
                    <div className="flex items-center gap-2">
                      <Badge variant={option.badge}>{option.label}</Badge>
                    </div>
                  )}
                />
                {errors.priority && (
                  <p className="text-sm text-destructive">{errors.priority}</p>
                )}
              </div>

              {/* User Selection */}
              <div className="grid gap-2">
                <Label className="text-sm font-medium text-foreground">
                  Recipients <span className="text-destructive">*</span>
                  <span className="text-muted-foreground font-normal"> (Select users or all)</span>
                </Label>
                <Select<UserOption, true>
                  name="tokens"
                  isMulti
                  options={userOptions}
                  value={getSelectedUserOptions()}
                  onChange={handleUserSelection}
                  placeholder={
                    isLoadingUsers ? "Loading users..." : "Search and select users..."
                  }
                  isDisabled={isSubmitting || isLoadingUsers}
                  styles={userSelectStyles}
                  isLoading={isLoadingUsers}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                />
                {errors.tokens && (
                  <p className="text-sm text-destructive">{errors.tokens}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Selected {formData.tokens.length} of {validUsers.length} user(s) with valid tokens
                </p>
              </div>

              {/* Preview */}
              <div className="grid gap-2">
                <Label className="text-sm font-medium text-foreground">
                  Preview
                </Label>
                <div className="border rounded-lg p-4 bg-background shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-base text-foreground">
                      {formData.title || "Notification Title"}
                    </h4>
                    <Badge
                      variant={getPriorityColor(formData.priority)}
                      className="ml-2 capitalize text-xs font-medium"
                    >
                      {formData.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formData.body || "Notification message will appear here..."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Just now • To {formData.tokens.length || "0"} user(s) {getNotificationTypeText()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="border-t pt-4 gap-3 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="px-6 py-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-medium transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting || formData.tokens.length === 0 || (!formData.sendPush && !formData.sendEmail)}
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#0997be] hover:bg-[#0997be] disabled:bg-blue-400 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notifications
                </>
              )}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
