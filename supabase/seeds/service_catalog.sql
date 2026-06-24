-- Z and Z OS · service_catalog seed (ServiceTitan pricebook "Services" sheet)
-- Generated from the Pricebook export dated 2026-06-23. Re-runnable: upserts by code.
-- Apply 009_service_catalog.sql first, then run this in the Supabase SQL editor.
set search_path = public;

insert into service_catalog
  (code, servicetitan_sku_id, name, description, category, price_cents, cost_cents, hours, taxable, active)
values
('Service', '106', 'Service', 'Service', 'Drain Lines', 0, 0, 0, false, true),
('HRSERVICE', '6657', 'Hourly Service', 'Hourly Service', 'Pumps', 22500, 0, 0, false, true),
('C9101', '2555204', 'Sewer Lateral Replacement', 'Replace Sewer Lateral', 'Drain Lines', 0, 0, 0, true, true),
('C1600', '2555461', 'Repair 1 1/4" exposed copper line, up to 5''', 'Repair 1 1/4" exposed copper line, up to 5''', 'Drain Line Repair - Copper', 56222, 0, 1.75, true, true),
('C1715', '2555462', 'Replace waste piping under house', 'Cut out and remove the old waste piping exposed under the house.  Furnish ind install properly supported ABS plastic piping from the vertical drop to the main stack or sewer drain tie in.', 'Drain Line Repair - Plastic
Drain Line Repair - Cast Iron', 0, 0, 0, true, true),
('C1770', '2555464', 'Install 3" cast iron clean-out with plug', 'Install 3" cast iron clean-out with plug', 'Drain Line Repair - Cast Iron', 58071, 0, 1.75, true, true),
('C1720 (1)', '2555588', 'Repair 3" exposed cast iron line, up to 5'' (1)', 'Repair 3" exposed cast iron line, up to 5''', 'Drain Line Repair - Cast Iron', 62139, 0, 1.75, true, false),
('D10999', '2555590', '3/4" Water pressure regulator in copper or plastic pipe - exposed', '3/4" Water pressure regulator in copper or plastic pipe - exposed', 'Water Pressure Regulators', 45042, 0, 2, true, true),
('C1720', '2555715', 'Repair 3" exposed cast iron line, up to 5''', 'Repair 3" exposed cast iron line, up to 5''', 'Drain Line Repair - Cast Iron', 62139, 0, 1.75, true, true),
('C1720 1', '2555972', 'Repair 3" exposed cast iron line, up to 5''', 'Repair 3" exposed cast iron line, up to 5''', 'Drain Line Repair - Cast Iron', 62139, 0, 1.75, true, false),
('C1200', '2556099', 'Cable line thru access to attempt to clear stoppage', 'Cable line thru access to attempt to clear stoppage', 'Stoppage - Main Line or Large Wasteline', 32500, 0, 1.3, false, true),
('C1550', '2556101', 'Install 4" ABS 2-way clean-out fitting - exposed', 'Install 4" ABS 2-way clean-out fitting - exposed', 'Drain Line Repair - Plastic', 82502, 0, 2.5, true, true),
('C1530', '2556229', 'Repair 4" exposed plastic line, up to 5''', 'Repair 4" exposed plastic line, up to 5''', 'Drain Line Repair - Plastic', 59708, 0, 1.875, true, true),
('D11009', '2556484', '1" Water pressure regulator in copper or plastic pipe - exposed', '1" Water pressure regulator in copper or plastic pipe - exposed', 'Water Pressure Regulators', 65424, 0, 2, true, true),
('D2010', '2556485', 'Repair 1" exposed copper water line, up to 2''', 'Repair 1" exposed copper water line, up to 2''', 'Water line-Copper', 42799, 0, 1.5, true, true),
('c1000', '2556610', 'Attempt to clear stoppage at toilet or urinal by using toilet auger tool', 'Attempt to clear stoppage at toilet or urinal by using toilet auger tool.  Please note this may scratch the bottom of the bowl.  We can not be held responsible for scratching the bowl.', 'Stoppage - Toilet or Urinal', 19999, 0, 1, false, true),
('D2000', '2556612', 'Repair 1/2" exposed copper water line, up to 2''', 'Repair 1/2" exposed copper water line, up to 2''', 'Water line-Copper', 28563, 0, 1, true, true),
('C1005', '2556738', 'Attempt to clear stoppage at urinal by removing then resetting', 'Attempt to clear stoppage at urinal by removing then resetting', 'Stoppage - Toilet or Urinal', 45042, 0, 2.325, false, true),
('C1780', '2556739', 'Install 4" cast iron clean-out with plug', 'Install 4" cast iron clean-out with plug', 'Drain Line Repair - Cast Iron', 70268, 0, 2, true, true),
('D2005', '2556741', 'Repair 3/4" exposed copper water line, up to 2''', 'Repair 3/4" exposed copper water line, up to 2''', 'Water line-Copper', 29323, 0, 1, true, true),
('C1100', '2556866', 'Cable line thru access to attempt to clear stoppage', 'Cable line thru access to attempt to clear stoppage', 'Stoppage - Small Wasteline (Sink, Laundry, Tub, Shower)', 22268, 0, 1, false, true),
('C1305', '2556995', 'Hydro Scrub™ - Trailer Jetter - 2 hour minimum', 'Hydro Scrub™ - Trailer Jetter - 2 hour minimum', 'HydroScrub', 98542, 0, 3.5, false, true),
('C1620', '2557124', 'Repair 2" exposed copper line, up to 5''', 'Repair 2" exposed copper line, up to 5''', 'Drain Line Repair - Copper', 67719, 0, 2, true, true),
('C1810', '2557126', 'Video Camera Survey - 2 hour minimum', 'Video Camera Survey - 2 hour minimum', 'Video Scan/Pipe Location', 45042, 0, 2, true, true),
('C1610', '2557380', 'Repair 1 1/2" exposed copper line, up to 5''', 'Repair 1 1/2" exposed copper line, up to 5''', 'Drain Line Repair - Copper', 57920, 0, 1.75, true, true),
('C1710', '2557507', 'Repair 2" exposed cast iron line, up to 5''', 'Repair 2" exposed cast iron line, up to 5''', 'Drain Line Repair - Cast Iron', 58888, 0, 1.75, true, true),
('C1120', '2557634', 'Furnish and Install new P-trap at same time as clearing drain through waste tee', 'Furnish and install a new 1-1/2 P-trap', 'Stoppage - Small Wasteline (Sink, Laundry, Tub, Shower)', 19499, 0, 0.5, false, true),
('C1230', '2557762', 'Cable line thru toilet flange by removing and resetting toilet to attmpt to clear stoppage', 'Cable line thru toilet flange by removing and resetting toilet to attmpt to clear stoppage', 'Stoppage - Main Line or Large Wasteline
Stoppage - Toilet or Urinal', 57500, 0, 2.25, false, true),
('C1520', '2557764', 'Repair 3" exposed plastic line, up to 5''', 'Repair 3" exposed plastic line, up to 5''', 'Drain Line Repair - Plastic', 54872, 0, 1.75, true, true),
('C1310', '2557890', 'Hydro Scrub - Trailer Jetter - Additional Hour after 2 hour minimum - per hour', 'Hydro Scrub - Trailer Jetter - Additional Hour after 2 hour minimum - per hour', 'HydroScrub', 30342, 0, 0.5, false, true),
('C1830', '2557892', 'Video main line through accessible clean-out - per hour', 'Video main line through accessible clean-out - per hour', 'Video Scan/Pipe Location', 23542, 0, 1, true, true),
('C1500', '2558018', 'Repair 1 1/2" exposed plastic line, up to 5''', 'Repair 1 1/2" exposed plastic line, up to 5''', 'Drain Line Repair - Plastic', 44100, 0, 1.5, true, true),
('C1510', '2558146', 'Repair 2" exposed plastic line, up to 5''', 'Repair 2" exposed plastic line, up to 5''', 'Drain Line Repair - Plastic', 46610, 0, 1.5, true, true),
('C1750', '2558148', 'Install 1 1/2" cast iron clean-out with plug', 'Install 1 1/2" cast iron clean-out with plug', 'Drain Line Repair - Cast Iron', 45204, 0, 1.5, true, true),
('C1730', '2558402', 'Repair 4" exposed cast iron line, up to 5''', 'Repair 4" exposed cast iron line, up to 5''', 'Drain Line Repair - Cast Iron', 70843, 0, 2, true, true),
('C1760', '2558530', 'Install 2" cast iron clean-out with plug', 'Install 2" cast iron clean-out with plug', 'Drain Line Repair - Cast Iron', 58816, 0, 1.75, true, true),
('D2215', '2571202', 'Install 1-1/4" ball valve in exposed copper pipe', 'Install 1-1/4" ball valve in exposed copper pipe', 'Water Line Repair - Valves', 45747, 0, 1.5, true, true),
('F4340', '2571203', 'Install emergency shut off valve (2)', 'Install emergency shut off valve (2)', 'Kitchen Sink Repair
Lavatory Sink Repairs', 29200, 0, 0, true, true),
('F4422', '2571205', 'Replace Delta pressure balance cartridge 1700/1900 series', 'Replace Delta pressure balance cartridge 1700/1900 series', 'Tub and Shower Faucet Repair', 33000, 0, 1, true, true),
('D2110', '2571330', 'Repair 1 1/2" exposed plastic water line, up to 2''', 'Repair 1 1/2" exposed plastic water line, up to 2''', 'Water Line Repair - Plastic', 35372, 0, 1.25, true, true),
('F4432', '2571331', 'Change Tub spout', 'Change Tub spout', 'Tub and Shower Faucet Repair', 23139, 0, 1, true, true),
('D2220', '2571458', 'Install 1 1/2" ball valve in exposed copper pipe', 'Install 1 1/2" ball valve in exposed copper pipe', 'Water Line Repair - Valves', 60138, 0, 1.75, true, true),
('E3080', '2571459', 'Install customer supplied kitchen faucet - Basic install', 'Install customer supplied kitchen faucet - Basic install', 'Kitchen Faucets', 34642, 0, 1.25, true, true),
('E3205', '2571460', 'Install ISE PRO880 - 7/8hp Disposer with 8 year in home warranty from mfg', 'Install ISE PRO880 - 7/8hp Disposer with 8 year in home warranty from mfg', 'Disposer', 63378, 0, 1.13, true, true),
('D2225', '2571586', 'Install 2" ball valve in exposed copper pipe', 'Install 2" ball valve in exposed copper pipe', 'Water Line Repair - Valves', 73552, 0, 2, true, true),
('E3085', '2571714', 'Install customer supplied kitchen faucet-Remove Garbage Disposal, p-trap, etc', 'Install customer supplied  kitchen faucet - Remove and reinstall Garbage dispsoal, p-trap, etc', 'Kitchen Faucets', 44782, 0, 1.75, true, true),
('E3200', '2571842', 'Install ISE Pro 1100XL - 1.1 HP with 12 year in home warranty from mfg', 'Install ISE Pro 1100XL - 1.1 HP with 12 year in home warranty from mfg', 'Disposer', 85405, 0, 1.13, true, true),
('f4704', '2571843', '2-Piece Toilet - elongated with seat', '2-Piece Toilet - elongated with seat', 'Toilet', 82405, 0, 2, true, true),
('E3210', '2571970', 'Install ISE PRO750 - 3/4hp Disposer with 6 year in home warranty from mfg', 'Install ISE PRO750 - 3/4hp Disposer with 6 year in home warranty from mfg', 'Disposer', 55514, 0, 1.13, true, true),
('F4401', '2572099', 'Furnish and install a new tub/shower valve', 'Furnish and install a new Delta single handle tub/shower faucet.
Includes opening sheet rock wall, no sheet rock wall repair is included.  Any demolition of Tile will be extra', 'Tub and Shower Faucet Repair', 235000, 0, 8, true, true),
('E3240', '2572226', 'Install customer supplied disposer', 'Install customer supplied disposer', 'Disposer', 27928, 0, 1.5, true, true),
('E3300', '2572354', 'Clear and Re-set jammed disposer', 'Clear and Re-set jammed disposer', 'Disposer', 19994, 0, 1, true, true),
('E3310', '2572482', 'Install chrome/stainless steel basket strainer', 'Install chrome/stainless steel basket strainer', 'Kitchen Sink Repair', 25942, 0, 0.9, true, true),
('E3311', '2572610', 'Replace 1-1/2" Chrome Plated P-trao', 'Furnish and install a new chrome plated p trap including all new gaskets.', 'Kitchen Sink Repair', 23932, 0, 0.75, true, true),
('E3315', '2572738', 'Replace continuous waste on two-compartment sink', 'Replace continuous waste on two-compartment sink', 'Kitchen Sink Repair', 28551, 0, 0.825, true, true),
('F28095', '2572739', 'Flushometer major rebuild - Repair of handle, vacuum breaker and flush actuator cartridge.', 'Flushometer major rebuild - Repair of handle, vacuum breaker and flush actuator cartridge.', 'Flushometer Valve Repairs - Toilets and Urinal', 36764, 0, 1, true, true),
('E3355', '2572866', 'Install emergency shut off (Qty 1)', 'Install emergency shut off (Qty 1)', 'Kitchen Sink Repair', 21200, 0, 0.75, true, true),
('E3370', '2572994', 'Install two faucet supplies', 'Install two faucet supplies', 'Kitchen Sink Repair', 22775, 0, 0.75, true, true),
('E3380', '2573122', 'Install dual emergency shut off valve', 'Install dual emergency shut off valve', 'Kitchen Sink Repair', 31053, 0, 1, true, true),
('F4830', '2573124', 'Minor toilet rebuild - Replacement of fill valve, water control diaphragm, stainless steel supply line.', 'Minor toilet rebuild - Replacement of fill valve, water control diaphragm, stainless steel supply line.  This warranty DOES NOT COVER any damages caused by the use of in-tank cleaners.', 'Toilet Repair', 30512, 0, 1.5, true, true),
('E3400', '2573250', 'Install customer supplied dishwasher by removing existing unit or installing in a prepared area', 'Install customer supplied dishwasher by removing existing unit or installing in a prepared area', 'Dishwasher', 46782, 0, 2, true, true),
('F28085', '2573251', 'Replace flushometer valve on toilet or urinal', 'Replace flushometer valve on toilet or urinal', 'Flushometer Valve Repairs - Toilets and Urinal', 42586, 0, 1, true, true),
('F28105', '2573253', 'Flushometer minor rebuild - Flush actuator cartridge', 'Flushometer minor rebuild - Flush actuator cartridge', 'Flushometer Valve Repairs - Toilets and Urinal', 25058, 0, 0.75, true, true),
('F4820', '2573255', 'Remove & re-set toilet - Replace wax ring and bolts', 'Remove & re-set toilet - Replace wax ring and bolts', 'Toilet Repair', 27280, 0, 1, true, true),
('E3410', '2573378', 'Install dishwasher air gap', 'Install dishwasher air gap', 'Dishwasher', 28422, 0, 1, true, true),
('E3600', '2573506', 'Install ice maker line', 'Install ice maker line', 'Ice Maker', 43109, 0, 1.5, true, true),
('F4410', '2573635', 'Replace double handle stem units', 'Replace double handle stem units', 'Tub and Shower Faucet Repair', 30512, 0, 1, true, true),
('f4505', '2573637', 'Replace Shower compression drain', 'Disconnect and remove the old leaking shower drain.  Furnish and install a new compression shower drain.  Reconnect the new shower drain to the existing piping.', 'Tub and Shower Repair', 93090, 0, 3, true, true),
('F4160', '2573762', 'Install customer supplied 4" center set lavatory faucet - Normal conditions', 'Install customer supplied 4" center set lavatory faucet - NORMAL conditions', 'Lavatory Faucet Replacement', 31655, 0, 1.2, true, true),
('F4310', '2573764', 'Replace 1-1/4" or 1-1/2"  p-trap drain assembly', 'Replace 1-1/4" or 1-1/2"  p-trap drain assembly', 'Lavatory Sink Repairs', 27397, 0, 0.9, true, true),
('F4180', '2573890', 'Install customer supplied widespread lavatory faucet - Normal conditions', 'Install customer supplied widespread lavatory faucet - Normal conditions', NULL, 44075, 0, 2, true, true),
('F4405', '2573892', 'Rebuild ball type faucet - Delta/Peerless', 'Rebuild ball type faucet - Delta/Peerless', 'Tub and Shower Faucet Repair', 31638, 0, 1, true, true),
('F4300', '2574018', 'Install lavatory pop-up assembly', 'Install lavatory pop-up assembly', 'Lavatory Sink Repairs', 27285, 0, 1, true, true),
('F4425', '2574019', 'Install Price Pfister remodel kit in tub/shower faucet', 'Install Price Pfister remodel kit in tub/shower faucet', 'Tub and Shower Faucet Repair', 38590, 0, 1.5, true, true),
('F4345', '2574146', 'Install stainless steel braided supply line hoses (2)', 'Install stainless steel braided supply line hoses (2)', 'Lavatory Sink Repairs', 22775, 0, 0.75, true, true),
('F4420', '2574274', 'Replace Moen pressure balance cartridge', 'Replace Moen pressure balance cartridge', 'Tub and Shower Faucet Repair', 32182, 0, 1, true, true),
('F4725', '2574276', 'Install customer supplied toilet - Normal conditions', 'Install customer supplied toilet - Normal conditions', 'Toilet', 37542, 0, 1.5, true, true),
('f4424', '2574402', 'Kohler tub/shower faucet repair', 'Kohler tub/shower faucet repair', 'Tub and Shower Faucet Repair', 38504, 0, 1.5, true, true),
('F4450', '2574530', 'Replace Shower Head and Arm', 'Replace Shower Head and Arm', 'Tub and Shower Faucet Repair', 25992, 0, 1, true, true),
('F4700', '2574532', '2-Piece Toilet - white, round front with seat', '2-Piece Toilet - white, round front with seat', 'Toilet', 72180, 0, 2, true, true),
('F4500', '2574658', 'Replace tub waste & overflow unit', 'Replace tub waste & overflow unit', 'Tub and Shower Repair', 168158, 0, 6, true, true),
('F4510', '2574786', 'Replace tub trip lever plate', 'Replace tub trip lever plate', 'Tub and Shower Faucet Repair', 24720, 0, 1, true, true),
('F4825', '2574789', 'Major toilet rebuild - Replacement of fill valve, flush valve & water control diaphragm, tank lever act', 'Major toilet rebuild - Replacement of fill valve, flush valve & water control diaphragm, tank lever actuator, tank to bowl kit, stainless steel supply line.  This warranty DOES NOT COVER any damages caused by the use of in-tank cleaners.', 'Toilet Repair', 37519, 0, 1.25, true, true),
('F4715', '2574914', '2-Piece Toilet - comfort height (ADA) white, elongated with seat', '2-Piece Toilet - comfort height (ADA) white, elongated with seat', 'Toilet', 89030, 0, 2, true, true),
('F4866', '2587202', 'Install stainless steel braided toilet tank supply tube and emergency shut-off valve', 'Install stainless steel braided toilet tank supply tube and emergency shut-off valve', 'Toilet Repair', 27012, 0, 1.3, true, true),
('F4875', '2587330', 'Replace plastic toilet flange by pulling and re-setting toilet', 'Replace plastic toilet flange by pulling and re-setting toilet', 'Toilet Repair', 137955, 0, 5, true, true),
('F4880', '2587458', 'Replace cast iron toilet flange by pullng and re-setting-(lead & oakum)', 'Replace cast iron toilet flange by pulling and re-setting-(lead & oakum)', 'Toilet Repair', 179880, 0, 0, true, true),
('G5400', '2587586', 'Replace washing machine hose faucets - hot and cold', 'Replace washing machine hose faucets - hot and cold', 'Washing Machine', 27761, 0, 1, true, true),
('G5420', '2587588', 'Install stainless steel braided washing machine hoses; both sides - hot and cold', 'Install stainless steel braided washing machine hoses; both sides - hot and cold', 'Washing Machine', 26658, 0, 1, true, true),
('H31215', '2587714', 'Troubleshoot Tankless Water Heater -per hour', 'Troubleshoot Tankless Water Heater -per hour', 'Water Heater Repair - Tankless', 35000, 0, 1, true, true),
('H6200', '2587716', '30 Gallon electric water heater - 6 year warranty', '30 Gallon electric water heater - 6 year warranty', 'Water Heaters - Electric', 164358, 0, 3, true, true),
('H6301', '2587718', 'Replace thermocouple on gas water heater/Standard', 'Replace thermocouple on gas water heater/Standard', 'Water Heater Repairs - Tank Type', 37058, 0, 1, true, true),
('H6306', '2587719', 'Clean and adjust burner on gas water heater', 'Clean and adjust burner on gas water heater', 'Water Heater Repairs - Tank Type', 52900, 0, 1.5, true, true),
('H31216', '2587842', 'Descale tankless water heater', 'Descale tankless water heater heat exchanger', 'Water Heater Repair - Tankless', 58750, 0, 1.5, true, true),
('H6210', '2588355', '40 Gallon electric water heater - 6 year warranty', '40 Gallon electric water heater - 6 year warranty', 'Water Heaters - Electric', 162328, 0, 3, true, true),
('H6220', '2588357', '50 Gallon electric water heater - 6 year warranty', '50 Gallon electric water heater - 6 year warranty', 'Water Heaters - Electric', 155223, 0, 3, true, true),
('H6342', '2588483', 'Replace single element', 'Replace single element', 'Water Heater Repairs - Tank Type', 38361, 0, 1, true, true),
('H6100', '2589122', '30 Gallon natural gas water heater - standard vent - 6 year warranty', 'Furnish and install a new 30 Gallon Gas water heater.  The following work was performed during this service:
-Shut water down to the heater and drain the unit
-Inspect water and gas shut off valves
-Remove and dispose of the old water heater
-Set in place new heater
-Install new temperature and relief valve
-Install new flexible water supplies
-Install new flexible gas supply
-Install earth quake strapping
-Connect the Flue piping and modify as neccassary
-Fill the heater and check for water and gas leaks
-Light the water heater pilot and turn the heater on
-Check the flue for proper flue draw and to be sure there are no carbon monoxide leaks
-Adjust the temperature settings to optimal 120 Degrees
-Clean work area
-Show home owner the heater installation and review controls and settings', 'Water Heaters - Gas', 206850, 0, 4, true, true),
('H6110', '2589250', '40 Gallon natural gas water heater - standard vent - 6 year warranty', 'Furnish and install a new 40 Gallon Gas water heater.  The following work was performed during this service:
-Shut water down to the heater and drain the unit
-Inspect water and gas shut off valves
-Remove and dispose of the old water heater
-Set in place new heater
-Install new temperature and relief valve
-Install new flexible water supplies
-Install new flexible gas supply
-Install earth quake strapping
-Connect the Flue piping and modify as neccassary
-Fill the heater and check for water and gas leaks
-Light the water heater pilot and turn the heater on
-Check the flue for proper flue draw and to be sure there are no carbon monoxide leaks
-Adjust the temperature settings to optimal 120 Degrees
-Clean work area
-Show home owner the heater installation and review controls and settings', 'Water Heaters - Gas', 205255, 0, 4, true, true),
('H6130', '2589252', '75 Gallon natural gas water heater - standard vent - 6 year warranty - (starts at)', 'Furnish and install a new 75 Gallon Gas water heater.  The following work was performed during this service:
-Shut water down to the heater and drain the unit
-Inspect water and gas shut off valves
-Remove and dispose of the old water heater
-Set in place new heater
-Install new temperature and relief valve
-Install new flexible water supplies
-Install new flexible gas supply
-Install earth quake strapping
-Connect the Flue piping and modify as neccassary
-Fill the heater and check for water and gas leaks
-Light the water heater pilot and turn the heater on
-Check the flue for proper flue draw and to be sure there are no carbon monoxide leaks
-Adjust the temperature settings to optimal 120 Degrees
-Clean work area
-Show home owner the heater installation and review controls and settings', 'Water Heaters - Gas', 298310, 0, 4, true, true),
('H6120', '2589506', '50 Gallon natural gas water heater -standard vent - 6 year warranty', 'Furnish and install a new 50 Gallon Gas water heater.  The following work was performed during this service:
-Shut water down to the heater and drain the unit
-Inspect water and gas shut off valves
-Remove and dispose of the old water heater
-Set in place new heater
-Install new temperature and relief valve
-Install new flexible water supplies
-Install new flexible gas supply
-Install earth quake strapping
-Connect the Flue piping and modify as neccassary
-Fill the heater and check for water and gas leaks
-Light the water heater pilot and turn the heater on
-Check the flue for proper flue draw and to be sure there are no carbon monoxide leaks
-Adjust the temperature settings to optimal 120 Degrees
-Clean work area
-Show home owner the heater installation and review controls and settings', 'Water Heaters - Gas', 209025, 0, 4, true, true),
('H6192', '2589762', 'Install customer supplied gas water heater - up to 50 gallon - Normal installation', 'Install customer supplied gas water heater - up to 50 gallon - Normal installation', 'Water Heaters - Gas', 120000, 0, 4, true, true),
('H6290', '2590786', 'Install customer supplied electric water heater - up to 50 gallon - Normal installation', 'Install customer supplied electric water heater - up to 50 gallon - Normal installation', 'Water Heaters - Electric', 119952, 0, 3, true, true),
('H6302', '2591042', 'Replace thermocouple with pilot assembly on gas water heater/FVIR', 'Replace thermocouple with pilot assembly on gas water heater/FVIR', 'Water Heater Repairs - Tank Type', 52946, 0, 1.25, true, true),
('H6303', '2591170', 'Replace thermostat/gas control valve on gas water heater', 'Replace thermostat/gas control valve on gas water heater', 'Water Heater Repairs - Tank Type', 52900, 0, 1, true, true),
('H6315', '2591298', 'Install 1/2" gas ball valve with 24" flex connector', 'Install 1/2" gas ball valve with 24" flex connector', 'Water Heater Repairs - Tank Type', 32950, 0, 0.75, true, true),
('H6339', '2591426', 'Replace upper & lower thermostat', 'Replace upper & lower thermostat', 'Water Heater Repairs - Tank Type', 43318, 0, 1, true, true),
('Z9100', '2591810', 'Diagnostic fee', 'Diagnostic fee', NULL, 0, 0, 0, true, true),
('WHE-110', '4287495', '40 Gal Electric Water Heater', 'Install a 40 gallon electric water heater.', 'Electric', 0, 40882, 2.25, false, true),
('WHE-120', '4287498', '50 Gal Electric Water Heater', 'Install a 50 gallon electric water heater.', 'Electric', 0, 44182, 2.25, false, true),
('WHA-100', '4287501', 'Install ST-5 Expansion Tank', 'Install a pressure expansion tank on your water heater to extend its life by relieving excess pressure when the water inside heats up.', 'Water Heater Accessories', 0, 4000, 0.75, false, true),
('WPR-180', '4287504', 'Replace 1/2" - 3/4" ProPress Local Shutoff Valve', 'Replace ProPress local shutoff valve. The local shutoff valve allows you to isolate individual water pipes in your home and stop the water from flowing into those specific pipes.', 'Water Piping Repairs', 0, 2300, 0.25, false, true),
('PRV-100', '4287507', 'Install 3/4" PRV', 'Install a pressure reducing valve that maintains a safe operating water pressure in your home.', 'PRV', 0, 12400, 0.8, false, true),
('WM-140', '4287510', '3/4" Main Water Shutoff Valve', 'Install a premium 3/4" main water shutoff valve.', 'Water Service', 0, 2800, 1, false, true),
('BPI-100', '4350567', 'Standard Single Pole 15-30a Plug-In Breaker', 'Install/Replace Standard Single Pole 15-30a Plug-In Breaker', '(Breakers) Plug In Style Standard', 0, 988, 0.25, false, true),
('CE-ROM-100', '4350570', 'Romex Cir Ext - 15-20a Up to 10'' - Standard', 'Romex Extend Circuit 15-20a 120/240v Up to 10ft. Standard Difficulty.', '(Cir. Ext.) Romex - Standard', 0, 913, 1, false, true),
('ODFS-100', '4350573', 'Replace Hose Bibb', 'Replace your outside lawn faucet.', 'Outdoor Faucet/Sink', 0, 1075, 0.75, false, true),
('LUN-100', '4350576', 'Replace Emergency Shutoff Valve', 'Replace emergency shutoff valve.', 'Lav Sink Under', 0, 625, 0.35, false, true),
('TS-110', '4350579', 'Install Programmable Digital Thermostat', 'Remove existing thermostat and install a new programmable digital thermostat. Test all system operations.', 'Thermostat', 0, 7766, 0.5, false, true),
('CAP-170', '4350582', 'Replace Dual Run Capacitor 55+ mfd', 'Replace dual run capacitor 55+ mfd.', 'Capacitors/Contactors', 0, 1748, 0.41, false, true),
('MAIN-110', '4350586', 'Clear Main Line with Cables', 'Clear main line with a drain cables machine, which uses a steel snaking device to clear the blockage.', 'Main Line', 0, 0, 1.1, false, true),
('CBS-110', '4350589', 'Replace OEM Control Board', 'Replace manufacturer specific control board that controls all operations of the furnace.', 'Circuit Boards', 0, 0, 1, false, true),
('OUT-120', '4350592', 'Duplex Outlet 15/20a 120v', 'Install/Replace 15/20a 120v duplex outlet', 'Outlets', 0, 468, 0.25, false, true),
('CAP-100', '4350595', 'Replace Single Run Capacitor up to 20 mfd', 'Replace single run capacitor up to 20 mfd.', 'Capacitors/Contactors', 0, 545, 0.35, false, true),
('CAP-160', '4350599', 'Replace Dual Run Capacitor up to 20 - 50 mfd', 'Replace dual run capacitor up to 20 - 50 mfd.', 'Capacitors/Contactors', 0, 934, 0.42, false, true),
('ELEC-DIA-100', '4350603', 'Service/Dispatch Fee', 'Regular call for evaluation of the client request; includes travel.', 'Dispatch/Service Fee', 0, 0, 0, false, true),
('ODR-100', '4350606', 'Wall Mount Light Fixture Up to 10''', 'Install/Replace a customer supplied wall mounted light fixture at existing outlet up to 10''', 'Outdoor Fixtures', 0, 0, 0.75, false, true),
('CHR-1.00.0000', '4350609', 'Custom HVAC Repair (CHR-1.00.0000)', 'Specialized HVAC repair includes special order parts, equipment, or additional labor to complete.', '1 Hour Labor (HVAC)', 0, 0, 1, false, true),
('TUR-110', '4350612', 'Pull and Reset Toilet', 'Remove the toilet, clean, and prepare the mounting system at the floor and reset the toilet with a new wax seal and mounting hardware.', 'Toilet/Urinal Repair', 0, 615, 0.75, false, true),
('P-DIAG-100', '4350615', 'Evaluation Service Fee 1', 'Evaluation service call fee.', 'Plumbing Diagnostic Fee', 0, 0, 0, false, true),
('CER-1.00.0000', '4350618', 'Custom Electrical Repair (CER-1.00.0000)', 'Specialized Electrical repair includes special order parts, equipment, or additional labor to complete.', '1 Hour Labor (ELEC)', 0, 0, 1, false, true),
('WHNG-100', '4350621', '40 Gal Natural Gas Water Heater (Standard)', 'Install a 40 gallon natural gas standard water heater.', 'Natural Gas', 0, 51836, 2.25, false, true),
('TUR-210', '4350624', 'Toilet Fill Valve/Supply Line Replacement', 'Replace fill valve and water supply line in the toilet tank.', 'Toilet/Urinal Repair', 0, 1040, 0.55, false, true),
('TSF-180', '4350627', 'Rebuild Tub/Shower Faucet', 'Replace the necessary stems, seats, and washers to ensure proper operation of faucet.', 'Tub/Shower Faucet', 0, 909, 0.5, false, true),
('SWI-150', '4350630', 'Single Pole 15/20a Switch', 'Install/Replace 15/20a switch', 'Switches', 0, 273, 0.25, false, true),
('ELEC-DIA-140', '4350633', 'Minor Diagnostic/Troubleshooting', 'Minor troubleshooting or diagnostic on single fixture, device, or appliance.', 'Diagnosis/Troubleshooting', 0, 1572, 0.5, false, true),
('DC-ROM-110', '4350636', 'Romex Ded Cir - 15-20a 11 to 20'' - Standard', 'Romex Dedicated Circuit 15-20a 120/240v Up to 20ft. Standard Difficulty', '(Ded. Cir.) Romex - Standard', 0, 1826, 2, false, true),
('BPI-110', '4350639', 'Standard Double Pole 15-60a Plug-In Breaker', 'Install/Replace Standard Double Pole 15-60a Plug-In Breaker', '(Breakers) Plug In Style Standard', 0, 2115, 0.25, false, true),
('GFR-100', '4350642', 'Replace Hot Surface Ignitor', 'Remove the existing hot surface ignitor and install a new hot surface ignitor. Test furnace operations to ensure proper firing and combustion.', 'Burners & Ignition', 0, 1903, 0.54, false, true),
('CS-110', '4350646', 'Install C/S Kitchen/Laundry Faucet', 'Install a customer supplied kitchen or laundry faucet including a thorough check of all shutoffs under the sink, as well as connecting water supply lines.', 'C/S Faucet/Sink', 0, 1170, 1, false, true),
('HVAC-DIAG-100', '4350649', 'Dispatch Charge - HVAC', 'Perform full system evaluation.', 'HVAC Diagnostic Fee', 0, 0, 0, false, true),
('ODFS-110', '4350652', 'Replace Hose Bibb Frost Free', 'Replace your outside lawn faucet with a frost free version that ensures protection against freezing and undesirable contamination of your drinking water through back siphoning.', 'Outdoor Faucet/Sink', 0, 3877, 1.5, false, true),
('SWI-160', '4350655', '3 Way Switch', 'Install/Replace a 3 way switch', 'Switches', 0, 383, 0.25, false, true),
('CHR-0.00.0000', '4350658', 'Custom HVAC Repair (CHR-0.00.0000)', 'Specialized HVAC repair includes special order parts, equipment, or additional labor to complete.', 'No Labor (HVAC)', 0, 0, 0, false, true),
('CFM-100', '4350661', 'Replace Universal Condenser Fan Motor 1/6-1/2 HP', 'Remove the existing fan motor on the outdoor unit. Install new fan motor with existing fan blade and test all operations.', 'Condenser Fan Motor', 0, 12384, 1.08, false, true),
('PAN-390', '4350665', 'Panel Rejuvenation - Partial (Up to 20 Circuits)', 'Replace all standard circuit breakers (up to 20) inside of the panel box and tighten all connections (main breaker, GFCI, AFCI  not included)', 'Panel Repair/Install', 0, 19756, 1.5, false, true),
('PAN-370', '4350668', 'Panel Rejuvenation - Full (Up to 20 Circuits)', 'Replace all standard circuit breakers (up to 20) inside of the panel box and make all new connections includes separating grounds and neutrals (main breaker, GFCI, AFCI not included)', 'Panel Repair/Install', 0, 19756, 2.25, false, true),
('KAPP-150', '4350671', 'Install 1/2 HP Garbage Disposer', 'Provide and install a 1/2 hp garbage disposer.', 'Kitchen Appliances', 0, 11400, 1, false, true),
('CLE-110', '4350674', 'Remove and Clean Blower Assembly', 'Remove, clean, and reinstall the indoor fan assembly to ensure proper airflow and air quality in the HVAC system.', 'Cleaning & Maintenance', 0, 1151, 1, false, true),
('RRL-120', '4350678', 'Refrigerant Leak Search', 'Use an electronic leak detector to determine the location of a refrigerant leak.', 'Refrigerant & Leak Search', 0, 0, 0.81, false, true),
('BPI-140', '4350682', 'Standard Single Pole GFCI/AFCI 15-30a Plug-In Breaker', 'Install/Replace Standard Single Pole GFCI/AFCI 15-30a Plug-In Breaker', '(Breakers) Plug In Style Standard', 0, 4496, 0.25, false, true),
('WHNG-130', '4350685', '50 Gal Natural Gas Water Heater (Standard)', 'Install a standard 50 gallon natural gas water heater.', 'Natural Gas', 0, 65276, 2.25, false, true),
('FXT-100', '4350688', 'C/S Flush/Semi-Flush Mounted Light Fixture - Up to 10''', 'Install/Replace a customer supplied flush/semi flush mounted light fixture at existing outlet up to 10''', 'Fixtures', 0, 0, 0.75, false, true),
('PAN-430', '4350691', 'Trace/Identify/Label Panel - Up to 24 Circuits', 'Trace Out/Identify/Label Panels up to 24 Circuits', 'Panel Repair/Install', 0, 0, 1, false, true),
('CAP-210', '4350694', 'Contactor 30/40 Amp - 1 Pole', 'Replace contactor 30/40 amp - 1 pole.', 'Capacitors/Contactors', 0, 939, 0.55, false, true),
('ELEC-DIA-150', '4350697', 'Standard Diagnostic/Troubleshooting', 'Standard troubleshooting or diagnostic with problem isolated to a single circuit.', 'Diagnosis/Troubleshooting', 0, 1572, 1.25, false, true),
('DLD-130', '4350700', 'Water Leak Diagnosis - Additional Access Required in Wall/Ceiling', 'Open an access point in ceiling or wall to work on piping or locate leaks.', 'Diagnose Source of Water Leak', 0, 0, 1.25, false, true),
('DIM-100', '4350703', 'Standard Dimmer 600w', 'Install/Replace standard dimmer Up to 600w', 'Dimmers', 0, 1757, 0.5, false, true),
('TUR-140', '4350706', 'Complete Tank Rebuild', 'Replace the flapper and fill valve, tank lever, and gaskets in the toilet tank to save water prolong the life and maximize the flush efficiency of your toilet.', 'Toilet/Urinal Repair', 0, 3334, 1, false, true),
('TUR-120', '4350709', 'Replace Flapper', 'Replace the toilet flapper inside the toilet tank to save water and prevent ghost flushing.', 'Toilet/Urinal Repair', 0, 359, 0.25, false, true),
('DCX-100', '4350712', 'Equipment Disconnect - 30-60 amp', 'Install or replace disconnect on equipment.', 'Disconnects', 0, 1295, 1, false, true),
('SRG-100', '4350715', 'Surge Protector - Primary', 'Install/Replace Whole home surge protector (primary)', 'Surge Protection', 0, 12269, 1.25, false, true),
('RRL-140', '4350718', 'Add 1-3 lb R-22 Refrigerant', 'Add 1-3 lb of R-22 Refrigerant.', 'Refrigerant & Leak Search', 0, 9750, 0.75, false, true),
('CS-220', '4350722', 'Install C/S Toilet', 'Install a customer supplied toilet. Includes any fastening or sealing, as well as thorough testing to ensure proper installation.', 'C/S Toilet', 0, 1240, 0.85, false, true),
('ELEC-DIA-120', '4350725', 'Service/Dispatch Fee - After Hours Emergency', 'Emergency call after normal weekday business hours.', 'Dispatch/Service Fee', 0, 0, 0, false, true),
('TUR-150', '4350728', 'Partial Tank Rebuild', 'Replace the flapper and fill valve within the tank of your toilet.', 'Toilet/Urinal Repair', 0, 2238, 0.75, false, true),
('MTR-100', '4350731', 'Replace Indoor Blower Motor - 115V Universal 1/6-1/2 HP', 'Remove the existing fan motor and replace with a new indoor fan motor. Test all operations and adjust fan speed for proper airflow in the home.', 'Motors', 0, 10204, 1.1, false, true),
('CON-170', '4350734', 'Replace Condensate Pump', 'Remove existing condensate pump. Pipe in new condensate pump and ensure proper draining.', 'Condensate', 0, 5463, 0.54, false, true),
('BRN-100', '4350737', 'Clear Branch Drain Line with Cable', 'Attempt to clear the branch drain line by running large cables through the pipe.', 'Branches', 27500, 0, 1.25, false, true),
('TS-140', '4350740', 'Install Non-Programmable Thermostat', 'Remove existing thermostat and install a new non-programmable thermostat. Test all system operations.', 'Thermostat', 0, 3165, 0.5, false, true),
('CPR-0.00.0000', '4350743', 'Custom Plumbing Repair (CPR-0.00.0000)', 'Specialized Plumbing repair includes special order parts, equipment, or additional labor to complete.', 'No Labor (PLMB)', 0, 0, 0, false, true),
('MTR-110', '4350746', 'Replace Indoor Blower Motor - 240V Universal 1/6-1/2 HP', 'Remove the existing fan motor and replace with a new indoor fan motor. Test all operations and adjust fan speed for proper airflow in the home.', 'Motors', 0, 8433, 1.1, false, true),
('TU-110', '4350749', 'Precision Tune-up and Cleaning - A/C or H/P', 'Perform a tune-up and cleaning to help ensure reliable and safe operation.', 'Inspections/Tune-Ups', 0, 0, 1, false, true),
('OUT-140', '4350752', 'GFCI Outlet', 'Install/Replace GFCI Outlet', 'Outlets', 0, 2120, 0.25, false, true),
('TI-110', '4350755', 'Replace Toilet - Elongated', 'Replace toilet with a new elongated model including a thorough check of water shutoff and water supply line, as well as a new wax seal and hardware.', 'Toilet Install', 0, 11456, 1, false, true),
('CAP-260', '4350758', 'Install Hard Start Kit with Potential Relay', 'Install a hard start kit with a potential relay.', 'Capacitors/Contactors', 0, 4211, 0.41, false, true),
('CAP-230', '4350762', 'Contactor 30/40 Amp - 2 Pole', 'Replace contactor 30/40 amp - 2 pole.', 'Capacitors/Contactors', 0, 1770, 0.54, false, true),
('RRL-160', '4350765', 'Add 1-3 lb R-410A Refrigerant', 'Add 1-3 lb R-410A Refrigerant', 'Refrigerant & Leak Search', 0, 4128, 0.75, false, true),
('CPR-1.00.0000', '4350769', 'Custom Plumbing Repair (CPR-1.00.0000)', 'Specialized Plumbing repair includes special order parts, equipment, or additional labor to complete.', '1 Hour Labor (PLMB)', 0, 0, 1, false, true),
('PAN-410', '4350772', 'Panel Tune-Up (Up to 20 Circuits)', 'Tighten all connections inside of the panel box (up to 20)', 'Panel Repair/Install', 0, 0, 0.5, false, true),
('JXN-100', '4350775', 'Small Junction Box', 'Install/Replace Small Junction Box', 'Junction', 0, 156, 0.5, false, true)
on conflict (code) do update set
  servicetitan_sku_id = excluded.servicetitan_sku_id,
  name        = excluded.name,
  description = excluded.description,
  category    = excluded.category,
  price_cents = excluded.price_cents,
  cost_cents  = excluded.cost_cents,
  hours       = excluded.hours,
  taxable     = excluded.taxable,
  active      = excluded.active,
  updated_at  = now();
