{{- define "iq.name" -}}interview-question{{- end -}}
{{- define "iq.labels" -}}
app.kubernetes.io/name: {{ include "iq.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}
{{- define "iq.selectorLabels" -}}
app.kubernetes.io/name: {{ include "iq.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
