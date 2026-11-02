import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, AppState, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatTime, routines, totalSets, Routine, Session } from './src/workouts';

const KEY = 'workout.history.v1';
type Active = { routine: Routine; started: number; completed: string[] };
export default function App() {
  const { tab: selectedTab } = useLocalSearchParams<{ tab?: string }>();
  const tab = selectedTab === 'History' ? 'History' : 'Train';
  const setTab = (next: 'Train' | 'History') => router.setParams({ tab: next });
  const [history, setHistory] = useState<Session[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<Active | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  useEffect(() => { AsyncStorage.getItem(KEY).then(value => {
    if (value) { const data: unknown = JSON.parse(value); if (!Array.isArray(data) || !data.every(s => s && typeof s.id === 'string' && typeof s.routine === 'string' && typeof s.date === 'string' && Number.isFinite(s.sets) && Number.isFinite(s.seconds))) throw new Error('Invalid history'); setHistory(data); }
    setLoaded(true);
  }).catch(() => Alert.alert('History unavailable', 'Restart the app to retry loading your saved workouts.')); }, []);
  useEffect(() => {
    if (!active) return;
    const tick = () => setSeconds(Math.floor((Date.now() - active.started) / 1000));
    tick(); const timer = setInterval(tick, 1000); const listener = AppState.addEventListener('change', tick);
    return () => { clearInterval(timer); listener.remove(); };
  }, [active]);
  function toggle(key: string) { setActive(a => a ? { ...a, completed: a.completed.includes(key) ? a.completed.filter(k => k !== key) : [...a.completed, key] } : a); }
  async function finish() {
    if (!active || saving) return;
    setSaving(true);
    const next = [{ id: String(Date.now()), routine: active.routine.name, date: new Date().toISOString(), sets: active.completed.length, seconds: Math.floor((Date.now() - active.started) / 1000) }, ...history];
    try { await AsyncStorage.setItem(KEY, JSON.stringify(next)); setHistory(next); setActive(null); setTab('History'); }
    catch { Alert.alert('Could not save', 'Your workout is still open. Please try again.'); }
    finally { setSaving(false); }
  }
  const button = (label: string, action: () => void, disabled = false) => <Pressable accessibilityRole="button" disabled={disabled} onPress={action} style={[s.button, disabled && { opacity: 0.4 }]}><Text style={s.buttonText}>{label}</Text></Pressable>;
  return <SafeAreaProvider><SafeAreaView style={s.safe}><StatusBar style="light" />
    <View style={s.header}><Text style={s.logo}>workout<Text style={s.lime}>.</Text></Text><Text style={s.badge}>YOUR DAILY REP</Text></View>
    <ScrollView contentContainerStyle={s.content}>
      {active ? <>
        <Text style={s.eyebrow}>WORKOUT IN PROGRESS</Text><Text style={s.title}>{active.routine.name}</Text>
        <View style={s.stats}><View><Text style={s.stat}>{formatTime(seconds)}</Text><Text style={s.muted}>ELAPSED</Text></View><View><Text style={s.stat}>{active.completed.length}/{totalSets(active.routine)}</Text><Text style={s.muted}>SETS DONE</Text></View></View>
        <Text style={s.muted}>Tap a set when you finish. Rest at your own pace.</Text>
        {active.routine.exercises.map((e, i) => <View style={s.card} key={e.name}><Text style={s.cardTitle}>{e.name}</Text><Text style={s.muted}>{e.reps} reps per set</Text><View style={s.sets}>{Array.from({ length: e.sets }, (_, n) => { const key = `${i}-${n}`; const done = active.completed.includes(key); return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: done }} accessibilityLabel={`${e.name}, set ${n + 1}`} key={key} onPress={() => toggle(key)} style={[s.set, done && s.setDone]}><Text style={[s.setText, done && { color: '#111810' }]}>{done ? '✓' : n + 1}</Text></Pressable>; })}</View></View>)}
        {button(saving ? 'Saving…' : 'Finish & save workout', finish, active.completed.length === 0 || saving)}
        <Pressable disabled={saving} onPress={() => Alert.alert('Discard workout?', 'This session will not be saved.', [{ text: 'Keep training', style: 'cancel' }, { text: 'Discard', style: 'destructive', onPress: () => setActive(null) }])}><Text style={s.cancel}>Discard session</Text></Pressable>
      </> : tab === 'Train' ? <>
        <Text style={s.eyebrow}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</Text>
        <Text style={s.title}>Show up.{ '\n' }Get stronger.</Text><Text style={s.subtitle}>A little progress. Every single day.</Text>
        <View style={s.stats}><View><Text style={s.stat}>{history.length}</Text><Text style={s.muted}>WORKOUTS</Text></View><View><Text style={s.stat}>{history.reduce((n, h) => n + h.sets, 0)}</Text><Text style={s.muted}>SETS COMPLETED</Text></View></View>
        <Text style={s.section}>Your next move</Text><Text style={s.muted}>Bodyweight routines. No equipment needed.</Text>
        {routines.map((r, i) => <View style={s.card} key={r.name}><Text style={s.eyebrow}>0{i + 1} / {r.focus}</Text><Text style={s.cardTitle}>{r.name}</Text><Text style={s.subtitle}>{r.minutes} min estimate · {r.exercises.length} exercises</Text><Text style={s.exerciseList}>{r.exercises.map(e => e.name).join('  /  ')}</Text>{button('Start workout  ↗', () => { setSeconds(0); setActive({ routine: r, started: Date.now(), completed: [] }); }, !loaded)}</View>)}
      </> : <><Text style={s.eyebrow}>THE WORK ADDS UP</Text><Text style={s.title}>Your history.</Text><Text style={s.subtitle}>Saved on this phone. One session at a time.</Text>{history.length === 0 ? <View style={s.card}><Text style={s.cardTitle}>Your first rep starts here.</Text><Text style={s.subtitle}>Complete a workout to see it here.</Text>{button('Find a workout', () => setTab('Train'))}</View> : history.map(h => <View style={s.card} key={h.id}><Text style={s.eyebrow}>{new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text><Text style={s.cardTitle}>{h.routine}</Text><Text style={s.subtitle}>{h.sets} sets completed · {formatTime(h.seconds)}</Text></View>)}</>}
    </ScrollView>
    {!active && <View style={s.tabs}>{(['Train', 'History'] as const).map(t => <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === t }} key={t} onPress={() => setTab(t)} style={s.tab}><Text style={[s.tabText, tab === t && s.lime]}>{t === 'Train' ? '↗  ' : '◷  '}{t}</Text></Pressable>)}</View>}
  </SafeAreaView></SafeAreaProvider>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101410' }, header: { paddingHorizontal: 24, paddingVertical: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#293027' }, logo: { color: '#f4f6ee', fontSize: 28, fontWeight: '900', letterSpacing: -1.5 }, lime: { color: '#c5f776' }, badge: { color: '#9da894', fontSize: 10, letterSpacing: 1.5 }, content: { padding: 24, paddingBottom: 36, gap: 16 }, eyebrow: { fontSize: 10, letterSpacing: 1.6, fontWeight: '700', color: '#b9cf9e' }, title: { color: '#f1f4e9', fontSize: 44, fontWeight: '800', lineHeight: 49, letterSpacing: -1.7 }, subtitle: { color: '#aab3a4', fontSize: 15, lineHeight: 23 }, stats: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 22, paddingRight: 22, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#30382b', marginVertical: 8 }, stat: { color: '#d4f4ad', fontSize: 34, fontWeight: '600' }, muted: { color: '#9eaa96', fontSize: 11, lineHeight: 18 }, section: { color: '#f1f4e9', fontSize: 23, fontWeight: '700', marginTop: 8 }, card: { padding: 21, borderRadius: 20, backgroundColor: '#1d251c', borderWidth: 1, borderColor: '#333f2e', gap: 12 }, cardTitle: { color: '#f1f4e9', fontSize: 27, fontWeight: '700', letterSpacing: -0.6 }, exerciseList: { color: '#aab3a4', fontSize: 12, lineHeight: 21, marginBottom: 6 }, button: { minHeight: 52, borderRadius: 12, backgroundColor: '#c5f776', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }, buttonText: { color: '#17200f', fontSize: 15, fontWeight: '800' }, tabs: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#30382b', paddingVertical: 8 }, tab: { flex: 1, alignItems: 'center', padding: 14 }, tabText: { color: '#94a08c', fontSize: 15, fontWeight: '700' }, sets: { flexDirection: 'row', gap: 12 }, set: { width: 52, height: 52, borderRadius: 14, borderWidth: 1, borderColor: '#526247', alignItems: 'center', justifyContent: 'center' }, setDone: { backgroundColor: '#c5f776', borderColor: '#c5f776' }, setText: { color: '#d7e4cb', fontSize: 20, fontWeight: '700' }, cancel: { color: '#aab3a4', textAlign: 'center', padding: 16 },
});
