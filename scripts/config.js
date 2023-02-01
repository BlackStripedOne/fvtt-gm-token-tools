const GTT = {}

/**
 * Custom damage types for handling in special section
 */
GTT.damageTypes = {
  'fall': {
    'name': 'Sturzschaden',
    'description': 'Sturzschaden kann durch eine erfolgreiche Probe auf Körperbeherrschung(Springen) um QS verringert werden.',
    'options': {
      'hight': {
        'label': 'damage.fall.hight.label',
        'unit': 'damage.fall.hight.unit',
        'type': 'number',
        'range': {
          'min': 1,
          'max': 20
        },
        'default': 1,
        'format': '{{value}}d6[black]'
      },
      'impact': {
        'label': 'Untergrund Modifikator',
        'unit': 'SP',
        'type': 'chooseOne',
        'options': {
          '0': {
            'name': 'Normaler Boden (+/-0)',
            'value': '0'
          },
          '1': {
            'name': 'Fester Boden (+1)',
            'value': '1',
            'modText': 'Fester Boden: +1 SP'
          },
          '2': {
            'name': 'Harter Boden (+2)',
            'value': '2',
            'modText': 'Harder Boden: +2 SP'
          },
          '3': {
            'name': 'Sehr harter Boden (+3)',
            'value': '3',
            'modText': 'Sehr harter Boden: +3 SP'
          },
          '4': {
            'name': 'Schädigender Boden (+4)',
            'value': '4',
            'modText': 'Schädigender Boden: +4 SP'
          },
          '-1': {
            'name': 'Loser Boden (-1)',
            'value': '-1',
            'modText': 'Loser Boden: -1 SP'
          },
          '-2': {
            'name': 'Weicher Boden (-2)',
            'value': '-2',
            'modText': 'Weicher Boden: -2 SP'
          },
          '-3': {
            'name': 'Sehr weicher Boden (-3)',
            'value': '-3',
            'modText': 'Sehr weicher Boden: -3 SP'
          },
          '-4': {
            'name': 'Falldämpfender Boden (-4)',
            'value': '-4',
            'modText': 'Falldämpfender Boden: -4 SP'
          }
        },
        'default': '0'
      }
    },
    'formula': '@hight + @impact',
    'manualModification': true
  },
  'burn': {
    'name': 'Feuer- oder Säureschaden',
    'description': 'Feuer- oder Säureschaden wird pro Kampfrunde gewürfelt, solange der Held mit Feuer oder der Säre in Kontakt ist.',
    'options': {
      'area': {
        'label': 'Betroffener Bereich',
        'type': 'chooseOne',
        'options': {
          'small': {
            'name': 'Kleine Fläche betroffen',
            'value': '1d3'
          },
          'medium': {
            'name': 'Große Fläche betroffen',
            'value': '1d6'
          },
          'large': {
            'name': 'Ganzer Körper betroffen',
            'value': '2d6'
          }
        },
        'format': '{{value}}[black]'
      },
      'extreme': {
        'label': 'Große Hitze oder sehr starke Säure',
        'unit': 'SP verdoppelt',
        'type': 'boolean',
        'values': {
          'true': {
            'value': 2,
            'modText': 'Große Hitze/Starke Säure: 2xSP'
          },
          'false': {
            'value': 1
          }
        }
      }
    },
    'formula': '@area * @extreme',
    'manualModification': true
  }
}

export default GTT