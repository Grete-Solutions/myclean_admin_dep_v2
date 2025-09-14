import * as React from "react";
import Select, { StylesConfig, MultiValue, SingleValue, CSSObjectWithLabel, ControlProps, OptionProps } from "react-select";
import { Plus, Send, Loader2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
        className="w-[65vw] max-w-[900px] min-w-[500px] bg-background rounded-l-xl shadow-2xl p-0"
        side="right"
      >
        <div className="h-full flex flex-col">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-3xl font-bold text-foreground">
                  Send Notification
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-base mt-1">
                  Create and send notifications to selected users via push, email, or both channels
                </SheetDescription>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
            <div className="space-y-8">
              {/* Notification Type Selection */}
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-primary/10 rounded-md">
                    <Send className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Notification Channels</h3>
                  <span className="text-destructive">*</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id="sendPush"
                      checked={formData.sendPush}
                      onCheckedChange={(checked) => handleInputChange("sendPush", checked)}
                      disabled={isSubmitting}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 rounded">
                        <Bell className="h-3 w-3 text-blue-600" />
                      </div>
                      <Label htmlFor="sendPush" className="text-sm font-medium text-foreground cursor-pointer">
                        Push Notification
                      </Label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id="sendEmail"
                      checked={formData.sendEmail}
                      onCheckedChange={(checked) => handleInputChange("sendEmail", checked)}
                      disabled={isSubmitting}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-green-100 rounded">
                        <Send className="h-3 w-3 text-green-600" />
                      </div>
                      <Label htmlFor="sendEmail" className="text-sm font-medium text-foreground cursor-pointer">
                        Email Notification
                      </Label>
                    </div>
                  </div>
                </div>
                {errors.notificationType && (
                  <p className="text-sm text-destructive mt-3 flex items-center gap-1">
                    <span className="text-xs">⚠️</span> {errors.notificationType}
                  </p>
                )}
              </div>

              {/* Content Section */}
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-orange-100 rounded-md">
                    <span className="text-orange-600 text-sm font-bold">✏️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Notification Content</h3>
                </div>
                <div className="space-y-4">
                  {/* Title Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-sm font-medium text-foreground flex items-center gap-1">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter an engaging notification title..."
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className={`transition-all duration-300 rounded-lg border-2 h-11 ${
                        errors.title ? "border-destructive" : "border-border hover:border-primary/50"
                      } focus:ring-2 focus:ring-primary/50 bg-background`}
                      maxLength={100}
                      disabled={isSubmitting}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <span className="text-xs">⚠️</span> {errors.title}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {formData.title.length}/100 characters
                      </p>
                      {formData.title.length > 80 && (
                        <p className="text-xs text-amber-600">Approaching limit</p>
                      )}
                    </div>
                  </div>

                  {/* Body Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="body" className="text-sm font-medium text-foreground flex items-center gap-1">
                      Message <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="body"
                      placeholder="Write your notification message here..."
                      value={formData.body}
                      onChange={(e) => handleInputChange("body", e.target.value)}
                      className={`transition-all duration-300 rounded-lg border-2 ${
                        errors.body ? "border-destructive" : "border-border hover:border-primary/50"
                      } focus:ring-2 focus:ring-primary/50 bg-background resize-none`}
                      rows={4}
                      maxLength={500}
                      disabled={isSubmitting}
                    />
                    {errors.body && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <span className="text-xs">⚠️</span> {errors.body}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {formData.body.length}/500 characters
                      </p>
                      {formData.body.length > 400 && (
                        <p className="text-xs text-amber-600">Approaching limit</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-purple-100 rounded-md">
                    <span className="text-purple-600 text-sm font-bold">⚙️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Settings & Recipients</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Priority Field */}
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium text-foreground flex items-center gap-1">
                      Priority Level <span className="text-destructive">*</span>
                    </Label>
                    <Select<PriorityOption, false>
                      name="priority"
                      options={priorityOptions}
                      value={priorityOptions.find(
                        (option) => option.value === formData.priority
                      )}
                      onChange={handlePriorityChange}
                      placeholder="Choose priority level"
                      isDisabled={isSubmitting}
                      styles={prioritySelectStyles}
                      formatOptionLabel={(option) => (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={option.badge}
                            className={`text-xs ${
                              option.value === 'high'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : option.value === 'medium'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-600 text-white hover:bg-gray-700'
                            }`}
                          >
                            {option.label}
                          </Badge>
                        </div>
                      )}
                    />
                    {errors.priority && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <span className="text-xs">⚠️</span> {errors.priority}
                      </p>
                    )}
                  </div>

                  {/* Recipients Summary */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      Recipients Summary
                    </Label>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground/70">Selected Users</span>
                        <span className="text-sm font-semibold text-foreground">
                          {formData.tokens.length} / {validUsers.length}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${validUsers.length > 0 ? (formData.tokens.length / validUsers.length) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-foreground/60">
                          {Math.round(validUsers.length > 0 ? (formData.tokens.length / validUsers.length) * 100 : 0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Selection */}
                <div className="mt-6 space-y-2">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-1">
                    Select Recipients <span className="text-destructive">*</span>
                    <span className="text-muted-foreground font-normal text-xs">(Search and select users or choose all)</span>
                  </Label>
                  <Select<UserOption, true>
                    name="tokens"
                    isMulti
                    options={userOptions}
                    value={getSelectedUserOptions()}
                    onChange={handleUserSelection}
                    placeholder={
                      isLoadingUsers ? "Loading users..." : "Search and select recipients..."
                    }
                    isDisabled={isSubmitting || isLoadingUsers}
                    styles={userSelectStyles}
                    isLoading={isLoadingUsers}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                  />
                  {errors.tokens && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span className="text-xs">⚠️</span> {errors.tokens}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-foreground/60">
                    <span>{formData.tokens.length} recipients selected</span>
                    <span>{validUsers.length} total users available</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Preview Section */}
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-green-100 rounded-md">
                    <span className="text-green-600 text-sm font-bold">👁️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
                </div>
                <div className="bg-gradient-to-br from-background to-muted/20 border rounded-xl p-5 shadow-inner">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-base text-foreground truncate pr-2">
                          {formData.title || "Your notification title will appear here"}
                        </h4>
                        <Badge
                          variant={getPriorityColor(formData.priority)}
                          className={`capitalize text-xs font-medium flex-shrink-0 ${
                            formData.priority === 'high'
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : formData.priority === 'medium'
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                        >
                          {formData.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {formData.body || "Your notification message will appear here. This is where the detailed content of your notification will be displayed to users."}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          Just now
                        </p>
                        <div className="flex items-center gap-2">
                          {formData.sendPush && (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <Bell className="h-3 w-3" />
                              <span>Push</span>
                            </div>
                          )}
                          {formData.sendEmail && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <Send className="h-3 w-3" />
                              <span>Email</span>
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">
                            • {formData.tokens.length || "0"} recipient{formData.tokens.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-foreground/60 mt-3 text-center">
                  This is how your notification will appear to users
                </p>
              </div>
            </div>
          </div>

          <div className="border-t bg-muted/30 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-foreground/80">
                {formData.tokens.length > 0 && (
                  <span>
                    Ready to send to <strong className="text-foreground font-semibold">{formData.tokens.length}</strong> recipient{formData.tokens.length !== 1 ? "s" : ""}
                    {(formData.sendPush || formData.sendEmail) && (
                      <span className="ml-1 text-foreground/70">
                        via {(formData.sendPush && formData.sendEmail) ? "push & email" :
                             formData.sendPush ? "push notification" : "email"}
                      </span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 border-border hover:bg-muted hover:border-primary/50 text-foreground font-medium transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting || formData.tokens.length === 0 || (!formData.sendPush && !formData.sendEmail)}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 text-white animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Notifications
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
