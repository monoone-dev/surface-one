import { useState, type ReactElement } from "react";
import {
  Image,
  Pressable,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
  addFiles,
  fileRejectionMessage,
  formatFileSize,
  isImageFile,
  type FileLike,
  type FileRejection,
} from "@surface-one/core/file-upload";
import { useControllable } from "@surface-one/core/react/controllable";
import { useSoneMessages } from "../../context/messages";
import { useSoneStyles } from "../../theme/context";
import { SoneForegroundProvider, SoneText } from "../../theme/foreground";
import { useFocusRing } from "../../utils/focus";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { SoneSpinner } from "../spinner/spinner";

/** A picked file: what the app's picker returns (expo-document-picker's assets fit). */
export interface SonePickedFile extends FileLike {
  /** Where the file is: a `file://` or `content://` uri. */
  readonly uri: string;
}

export interface SoneFileUploadProps {
  /** The files (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: SonePickedFile[];
  readonly defaultValue?: SonePickedFile[];
  readonly onValueChange?: (files: SonePickedFile[]) => void;
  /**
   * Opens the app's picker and resolves the chosen files — `undefined` or `[]` for a
   * cancel. The package has no picker of its own:
   * `pick={async () => (await DocumentPicker.getDocumentAsync({ multiple: true })).assets?.map((a) => ({ name: a.name, size: a.size ?? 0, type: a.mimeType ?? "", uri: a.uri }))}`.
   */
  readonly pick: () =>
    SonePickedFile[] | undefined | Promise<SonePickedFile[] | undefined>;
  /** The web `accept` list the picked files are checked against: `image/*`, `.pdf`. */
  readonly accept?: string | null;
  /** More than one file; without it a new file replaces the current one. */
  readonly multiple?: boolean;
  /** The largest file, in bytes. */
  readonly maxSize?: number | null;
  /** The most files (with `multiple`). */
  readonly maxFiles?: number | null;
  /** Show image files as thumbnails in the list. */
  readonly preview?: boolean;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  /** The zone's text and name (default: the message). */
  readonly label?: string;
  /** A quieter line under it: the accepted types and the size limit. */
  readonly description?: string;
  readonly removeLabel?: (name: string) => string;
  readonly rejectionLabel?: (
    rejection: FileRejection<SonePickedFile>,
  ) => string;
  /** Files that were turned away by the last pick. */
  readonly onRejected?: (rejected: FileRejection<SonePickedFile>[]) => void;
  /** `pick` rejected. */
  readonly onPickError?: (error: unknown) => void;
  /** The locale file sizes are written in. */
  readonly locale?: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

const NO_FILES: SonePickedFile[] = [];

/**
 * `<sone-file-upload>` — the React Native twin: a dashed zone that runs the app's
 * `pick`, checks the files against `accept`, `maxSize` and `maxFiles` (an alert names
 * what was turned away), and lists them with their size, an image thumbnail and a
 * remove button. No native dependency: the app injects `pick`, as for SoneImagePicker.
 */
export function SoneFileUpload({
  value: valueProp,
  defaultValue = NO_FILES,
  onValueChange,
  pick,
  accept = null,
  multiple = false,
  maxSize = null,
  maxFiles = null,
  preview = true,
  disabled = false,
  invalid = false,
  label,
  description,
  removeLabel,
  rejectionLabel,
  onRejected,
  onPickError,
  locale = "en",
  style,
  testID,
}: SoneFileUploadProps): ReactElement {
  const messages = useSoneMessages();
  const [files, setFiles] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [busy, setBusy] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const focus = useFocusRing();
  const s = useSoneStyles((th) => {
    const t = th.tokens;
    return {
      root: { gap: t.space2, width: "100%" } as ViewStyle,
      zone: {
        minHeight: t.fileUploadMinH,
        alignItems: "center",
        justifyContent: "center",
        gap: t.space1,
        paddingVertical: t.space6,
        paddingHorizontal: t.space4,
        borderWidth: t.borderWidthThin,
        borderStyle: "dashed",
        borderColor: t.inputBorder,
        borderRadius: t.radiusLg,
        backgroundColor: t.inputBg,
      } as ViewStyle,
      pressed: { backgroundColor: t.surfaceHover } as ViewStyle,
      focused: {
        borderColor: t.accentEdge,
        boxShadow: t.focusRing,
      } as ViewStyle,
      invalid: { borderColor: t.invalidBorder } as ViewStyle,
      disabled: {
        opacity: t.disabledOpacity,
        backgroundColor: t.inputDisabledBg,
      } as ViewStyle,
      icon: {
        width: t.iconSizeLg,
        height: t.iconSizeLg,
        marginBottom: t.space1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: t.radiusPill,
        backgroundColor: t.surfaceHover,
      } as ViewStyle,
      item: {
        flexDirection: "row",
        alignItems: "center",
        gap: t.space3,
        padding: t.space2,
        borderWidth: t.borderWidthThin,
        borderColor: t.borderSubtle,
        borderRadius: t.radiusMd,
        backgroundColor: t.surfaceRaised,
      } as ViewStyle,
      thumb: {
        width: t.fileUploadThumb,
        height: t.fileUploadThumb,
        borderRadius: t.radiusSm,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: t.surfaceHover,
      } as ViewStyle,
      meta: { flex: 1, minWidth: 0 } as ViewStyle,
      zoneFg: {
        color: t.textSecondary,
        fontSize: t.fontSizeSm,
        lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
        iconSize: t.controlIcon,
      },
      title: { color: t.textPrimary, fontWeight: "500" as const },
      small: { color: t.textMuted, fontSize: t.fontSizeXs },
      name: { color: t.textPrimary, fontSize: t.fontSizeSm },
      error: { color: t.dangerText, fontSize: t.fontSizeSm },
    };
  }, []);

  const rules = { accept, maxSize, maxFiles, multiple };
  const run = async (): Promise<void> => {
    if (busy || disabled) return;
    setBusy(true);
    try {
      const picked = (await pick()) ?? [];
      if (!picked.length) return;
      const result = addFiles(files, picked, rules);
      setAlerts(
        result.rejected.map((r) =>
          rejectionLabel
            ? rejectionLabel(r)
            : fileRejectionMessage(r, rules, messages, locale),
        ),
      );
      if (result.rejected.length) onRejected?.(result.rejected);
      setFiles(result.value);
    } catch (error) {
      onPickError?.(error);
    } finally {
      setBusy(false);
    }
  };
  const title = label ?? messages.fileUploadLabel;
  const removeName = removeLabel ?? messages.fileUploadRemove;

  return (
    <View testID={testID} style={[s.root, style]}>
      <Pressable
        role="button"
        aria-label={title}
        accessibilityHint={description}
        aria-busy={busy || undefined}
        aria-disabled={disabled || undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled || busy}
        onPress={() => void run()}
        onFocus={focus.onFocus}
        onBlur={focus.onBlur}
        style={({ pressed }) => [
          s.zone,
          pressed && s.pressed,
          focus.focused && s.focused,
          invalid && s.invalid,
          disabled && s.disabled,
        ]}
      >
        <SoneForegroundProvider value={s.zoneFg}>
          <View style={s.icon}>
            {busy ? <SoneSpinner label={null} /> : <SoneIcon name="plus" />}
          </View>
          <SoneText style={s.title}>{title}</SoneText>
          {description ? (
            <SoneText style={s.small}>{description}</SoneText>
          ) : null}
        </SoneForegroundProvider>
      </Pressable>
      {alerts.length ? (
        <View role="alert">
          {alerts.map((m, i) => (
            <SoneText key={i} style={s.error}>
              {m}
            </SoneText>
          ))}
        </View>
      ) : null}
      {files.length ? (
        <View role="list" aria-label={messages.fileUploadList} style={s.root}>
          {files.map((file, i) => (
            <View key={`${file.uri}-${i}`} role="listitem" style={s.item}>
              {preview && isImageFile(file) ? (
                <Image
                  source={{ uri: file.uri }}
                  resizeMode="cover"
                  aria-hidden
                  style={s.thumb as ImageStyle}
                />
              ) : (
                <View style={s.thumb} aria-hidden>
                  <SoneForegroundProvider value={s.zoneFg}>
                    <SoneIcon name="document" />
                  </SoneForegroundProvider>
                </View>
              )}
              <View style={s.meta}>
                <SoneText style={s.name} numberOfLines={1}>
                  {file.name}
                </SoneText>
                <SoneText style={s.small}>
                  {formatFileSize(file.size, locale)}
                </SoneText>
              </View>
              <SoneButton
                variant="ghost"
                size="icon-sm"
                aria-label={removeName(file.name)}
                disabled={disabled}
                onPress={() => {
                  setFiles(files.filter((_, j) => j !== i));
                  setAlerts([]);
                }}
              >
                <SoneIcon name="close" />
              </SoneButton>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
