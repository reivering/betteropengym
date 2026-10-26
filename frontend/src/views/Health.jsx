import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { todayISO, fmtNum, fmtDate } from '../lib/format.js'
import { t } from '../lib/i18n.js'
import { activityTotal, mealForDay, nutritionTotals } from '../lib/health.js'
import Icon from '../components/Icon.jsx'
import { Button } from '../components/ui.jsx'

function RecordLink({ icon, title, detail, value, onClick }) {
  return <button className="health-record-link" onClick={onClick}>
    <span className="health-record-symbol"><Icon name={icon} /></span>
    <span className="health-record-copy"><strong>{title}</strong><small>{detail}</small></span>
    <span className="health-record-value">{value}</span>
    <Icon name="chevronRight" className="chev" />
  </button>
}

export default function Health() {
  const nav = useNavigate()
  const S = useStore(s => s.S)
  const day = todayISO()
  const meals = mealForDay(S, day)
  const nutrition = nutritionTotals(meals)
  const activity = activityTotal(S.activity?.records || [], 'active_energy', day)
  const weight = S.bodyweight?.at(-1)

  return <div className="health-page health-overview-page">
    <header className="hdr"><div><h1>{t('Health')}</h1><div className="sub">{t('Your latest health records')}</div></div></header>
    <section className="health-record-group" aria-labelledby="health-nutrition-heading">
      <h2 id="health-nutrition-heading">{t('Nutrition')}</h2>
      <RecordLink icon="fork" title={meals.length ? t('Today’s food') : t('No food logged today')}
        detail={meals.length ? `${Math.round(nutrition.protein)} g ${t('protein')} · ${meals.length} ${t('meals')}` : t('Food records will appear here after you log a meal.')}
        value={meals.length ? `${Math.round(nutrition.calories)} kcal` : ''} onClick={() => nav('/nutrition')} />
      <div className="health-record-action"><Button variant="plain" icon="plus" onClick={() => nav('/nutrition')}>{t('Log food')}</Button></div>
    </section>
    <section className="health-record-group" aria-labelledby="health-activity-heading">
      <h2 id="health-activity-heading">{t('Activity')}</h2>
      <RecordLink icon="flame" title={activity ? t('Active energy recorded') : t('No activity recorded today')}
        detail={activity ? t('Source-aware total for today') : t('Activity records appear here when available.')}
        value={activity ? `${Math.round(activity)} kcal` : ''} onClick={() => nav('/activity')} />
      <div className="health-record-action"><Button variant="plain" icon="plus" onClick={() => nav('/activity')}>{t('View activity')}</Button></div>
    </section>
    <section className="health-record-group" aria-labelledby="health-body-heading">
      <h2 id="health-body-heading">{t('Body')}</h2>
      <RecordLink icon="scale" title={weight ? t('Body weight') : t('No weight recorded')}
        detail={weight ? t('Last recorded {0}', fmtDate(weight.d, true)) : t('Add a measurement when you are ready.')}
        value={weight ? `${fmtNum(weight.w)} ${S.unit}` : ''} onClick={() => nav('/measurements')} />
      <div className="health-record-action"><Button variant="plain" icon="chevronRight" onClick={() => nav('/measurements')}>{t('Measurements')}</Button></div>
    </section>
    <section className="health-record-group health-privacy-row">
      <RecordLink icon="image" title={t('Progress photos')} detail={t('Private photos you choose to save.')}
        value="" onClick={() => nav('/progress-photos')} />
    </section>
  </div>
}
