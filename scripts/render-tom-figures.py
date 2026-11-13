"""Render web figures from the manuscript's reported tables; no inferred estimates."""
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
OUT = Path(__file__).resolve().parents[1] / 'static/assets/img/tom-audit'
plt.rcParams.update({'font.family':'DejaVu Sans', 'font.size':11, 'svg.fonttype':'none'})
categories=['Belief','Intention','Desire','Emotion','Knowledge']
pairs=['ToMBench /\nToMATO','ToMBench /\nCogToM','ToMATO /\nCogToM']
raw=np.array([[.658,.641,.584],[.698,.746,.662],[.671,.689,.740],[.805,.817,.782],[.650,.658,.729]])
delta=np.array([[.025,-.007,.008],[.034,.022,.035],[.103,.108,.026],[.056,.086,.036],[.113,.107,.026]])
fig,axs=plt.subplots(1,2,figsize=(12,5.4),layout='constrained')
fig.suptitle('27 models · 3 Theory-of-Mind benchmarks', fontsize=12, color='#52616b')
for ax,data,title,cmap,lo,hi in [(axs[0],raw,'A. Full-sample agreement','Blues',.5,.9),(axs[1],delta,'B. Cross-fit change after filtering','RdBu',-.12,.12)]:
 ax.imshow(data,cmap=cmap,vmin=lo,vmax=hi,aspect='auto')
 ax.set_xticks(range(3),pairs);ax.set_yticks(range(5),categories)
 ax.tick_params(length=0,pad=10);ax.set_title(title,loc='left',pad=18,fontweight='bold')
 for i in range(5):
  for j in range(3):
   val=f'{data[i,j]:.3f}' if ax is axs[0] else f'{data[i,j]:+.3f}'
   if ax is axs[1] and (i,j)!=(0,1): val+='*'
   color='white' if (ax is axs[0] and data[i,j]>.73) or (ax is axs[1] and data[i,j]>.075) else '#172631'
   ax.text(j,i,val,ha='center',va='center',color=color,fontweight='bold',fontsize=12)
 for spine in ax.spines.values():spine.set_visible(False)
 ax.set_xlabel('Kendall τᵦ' if ax is axs[0] else 'Δτᵦ (after − before)',labelpad=15)
for ext in ['svg','png']:fig.savefig(OUT/f'convergent-validity.{ext}',dpi=200,bbox_inches='tight',facecolor='white')
plt.close(fig)
kept=np.array([1898,3926,6215]); total=np.array([2860,5401,8513]);pct=100*kept/total
fig,ax=plt.subplots(figsize=(10,3.6),layout='constrained')
y=np.arange(3)
ax.barh(y,pct,color='#587c92',height=.5,label='Retained')
ax.barh(y,100-pct,left=pct,color='#e7e9eb',height=.5,label='Removed')
for i in range(3):
 ax.text(pct[i]/2,i,f'{pct[i]:.1f}% retained\n{kept[i]:,} / {total[i]:,}',ha='center',va='center',color='white',fontweight='bold')
 ax.text(pct[i]+(100-pct[i])/2,i,f'{100-pct[i]:.1f}%\nremoved',ha='center',va='center',color='#39444e')
ax.set_yticks(y,['ToMBench','ToMATO','CogToM']);ax.invert_yaxis();ax.set_xlim(0,100)
ax.set_xlabel('Percentage of full benchmark item set');ax.set_xticks([0,25,50,75,100],['0%','25%','50%','75%','100%'])
ax.set_title('Item retention after the discrimination filter (27 models)',loc='left',pad=18,fontweight='bold');ax.tick_params(length=0,pad=10)
for spine in ax.spines.values():spine.set_visible(False)
for ext in ['svg','png']:fig.savefig(OUT/f'item-discrimination.{ext}',dpi=200,bbox_inches='tight',facecolor='white')
