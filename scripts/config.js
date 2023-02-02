const GTT = {}

/**
 * Custom damage types for handling in special section
 */
GTT.damageTypes = {
  'fall': {
    'name': 'damage.fall.name',
    'description': 'damage.fall.description',
    'options': {
      'hight': {
        'label': 'damage.fall.hight',
        'unit': 'gridUnits',
        'type': 'number',
        'range': {
          'min': 1,
          'max': 20
        },
        'defValue': 1,
        'format': '{{value}}d6[black]'
      },
      'impact': {
        'label': 'damage.fall.ground',
        'unit': 'SP',
        'type': 'chooseOne',
        'options': {
          'softest': {
            'name': 'damage.fall.softest',
            'value': '-4',
            'modText': 'damage.fall.softestMod'
          },
          'softer': {
            'name': 'damage.fall.softer',
            'value': '-3',
            'modText': 'damage.fall.softerMod'
          },
          'soft': {
            'name': 'damage.fall.soft',
            'value': '-2',
            'modText': 'damage.fall.softMod'
          },
          'bitsoft': {
            'name': 'damage.fall.bitsoft',
            'value': '-1',
            'modText': 'damage.fall.bitsoftMod'
          },
          'normal': {
            'name': 'damage.fall.normal',
            'value': '0'
          },
          'bithard': {
            'name': 'damage.fall.bithard',
            'value': '1',
            'modText': 'damage.fall.bithardMod'
          },
          'hard': {
            'name': 'damage.fall.hard',
            'value': '2',
            'modText': 'damage.fall.hardMod'
          },
          'harder': {
            'name': 'damage.fall.harder',
            'value': '3',
            'modText': 'damage.fall.harderMod'
          },
          'hardest': {
            'name': 'damage.fall.hardest',
            'value': '4',
            'modText': 'damage.fall.harderMod'
          }
        },
        'defValue': 'normal'
      }
    },
    'formula': '(@hight + @impact) + @manual',
    'manualModification': true
  },
  'burn': {
    'name': 'damage.burn.name',
    'description': 'damage.burn.description',
    'options': {
      'area': {
        'label': 'damage.burn.areaLabel',
        'type': 'chooseOne',
        'defValue': 'small',
        'options': {
          'small': {
            'name': 'damage.burn.areaSmall',
            'value': '1d3'
          },
          'medium': {
            'name': 'damage.burn.areaMedium',
            'value': '1d6'
          },
          'large': {
            'name': 'damage.burn.areaLarge',
            'value': '2d6'
          }
        },
        'format': '{{value}}[black]'
      },
      'extreme': {
        'label': 'damage.burn.extremeLabel',
        'unit': 'damage.burn.extremeUnit',
        'type': 'boolean',
        'values': {
          'true': {
            'value': 2,
            'modText': 'damage.burn.extremeMod'
          },
          'false': {
            'value': 1
          }
        }
      }
    },
    'formula': '(@area * @extreme) + @manual',
    'manualModification': true
  }
}

export default GTT