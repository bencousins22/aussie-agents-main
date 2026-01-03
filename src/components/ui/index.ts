/**
 * UI Component Library - Aussie Agents
 *
 * Reusable, accessible, and consistent UI components
 * built with React 19 and TypeScript.
 */

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from "./Button";
export { Input, type InputProps, type TextareaProps, type CombinedInputProps } from "./Input";
export { Badge, type BadgeProps, type BadgeVariant, type BadgeSize } from "./Badge";
export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  type CardProps,
  type CardHeaderProps,
  type CardVariant,
} from "./Card";
export { Spinner, type SpinnerProps, type SpinnerSize, type SpinnerVariant } from "./Spinner";
export { Switch, type SwitchProps } from "./Switch";
export { Select, type SelectProps } from "./Select";

// Existing components
export { Toast, ToastContainer } from "./Toast";
export { Skeleton, SkeletonLine, SkeletonText, SkeletonCard, SkeletonList } from "./Skeleton";
export { DataFetcher } from "./DataFetcher";
export {
  PerformanceMonitor,
  VirtualizedList,
  LazyLoad,
  OptimizedImage,
} from "./Performance";
