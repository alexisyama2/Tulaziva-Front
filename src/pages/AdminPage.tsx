import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle,
  Pagination, Paper, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAddAltOutlined';
import { useTranslation } from 'react-i18next';
import { adminApi } from '@/api';
import ReportsTab from '@/components/admin/ReportsTab';
import ErrorState, { errorMessages } from '@/components/common/ErrorState';
import UserAvatar from '@/components/common/UserAvatar';
import { useNotify } from '@/context/NotificationContext';
import { formatBytes, formatDateTime } from '@/utils/format';
import PasswordField from '@/components/common/PasswordField';

function Pager({ total, size, page, onChange }: { total: number; size: number; page: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / size);
  if (pages <= 1) return null;
  return (
    <Stack alignItems="center" sx={{ p: 2 }}>
      <Pagination count={pages} page={page} onChange={(_, p) => onChange(p)} color="primary" shape="rounded" />
    </Stack>
  );
}

function NewAdminDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { success } = useNotify();
  const qc = useQueryClient();
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const create = useMutation({
    mutationFn: () => adminApi.createAdmin(form),
    onSuccess: () => {
      success(t('admin.created'));
      setForm({ displayName: '', email: '', password: '' });
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      onClose();
    },
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{t('admin.newAdmin')}</DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ pt: 1 }}>
          {create.error && <Alert severity="error">{errorMessages(create.error, t('errors.generic')).map((m) => <div key={m}>{m}</div>)}</Alert>}
          <TextField label={t('auth.displayName')} value={form.displayName} onChange={set('displayName')} />
          <TextField label={t('auth.email')} type="email" value={form.email} onChange={set('email')} />
          <PasswordField label={t('auth.password')} value={form.password} onChange={set('password')} helperText={t('auth.passwordHint')} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="contained" onClick={() => create.mutate()} disabled={create.isPending || !form.email || !form.password || !form.displayName}>
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function UsersTab() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['admin', 'users', page], queryFn: () => adminApi.users(page), placeholderData: (p) => p });

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setOpen(true)}>{t('admin.newAdmin')}</Button>
      </Stack>
      {isError ? <ErrorState error={error} /> : isLoading ? <CircularProgress /> : (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('admin.name')}</TableCell>
                  <TableCell>{t('admin.email')}</TableCell>
                  <TableCell>{t('admin.role')}</TableCell>
                  <TableCell>{t('admin.since')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <UserAvatar name={u.displayName} photoUrl={u.photoUrl} size={32} />
                        {u.displayName}
                      </Stack>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Chip size="small" label={u.role} color={u.role === 'Admin' ? 'secondary' : 'default'} /></TableCell>
                    <TableCell>{formatDateTime(u.createdAtUtc)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {data && <Pager total={data.totalCount} size={data.pageSize} page={page} onChange={setPage} />}
        </Paper>
      )}
      <NewAdminDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function AttachmentsTab() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['admin', 'attachments', page], queryFn: () => adminApi.attachments(page), placeholderData: (p) => p });

  return (
    <>
      <Alert severity="info" sx={{ mb: 2 }}>{t('admin.privacyNote')}</Alert>
      {isError ? <ErrorState error={error} /> : isLoading ? <CircularProgress /> : (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('admin.sender')}</TableCell>
                  <TableCell>{t('admin.file')}</TableCell>
                  <TableCell>{t('admin.size')}</TableCell>
                  <TableCell>{t('admin.date')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>{a.senderDisplayName}</TableCell>
                    <TableCell>{a.fileName}</TableCell>
                    <TableCell>{formatBytes(a.sizeBytes)}</TableCell>
                    <TableCell>{formatDateTime(a.createdAtUtc)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {data && <Pager total={data.totalCount} size={data.pageSize} page={page} onChange={setPage} />}
        </Paper>
      )}
    </>
  );
}

export default function AdminPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>{t('admin.title')}</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label={t('admin.users')} />
        <Tab label={t('admin.reports')} />
        <Tab label={t('admin.attachments')} />
      </Tabs>
      <Box>{tab === 0 ? <UsersTab /> : tab === 1 ? <ReportsTab /> : <AttachmentsTab />}</Box>
    </Container>
  );
}
