import 'package:flutter/widgets.dart';

/// 把「目前掛在畫面樹上的氣泡」登記到 [registry]（seq → BuildContext），離開時移除。
/// 用法：用它包住每個有 seq 的氣泡，之後就能從 registry 拿到每則訊息的 RenderBox 算位置。
class SeqTracker extends StatefulWidget {
  const SeqTracker({super.key, required this.seq, required this.registry, required this.child});

  final int seq;
  final Map<int, BuildContext> registry;
  final Widget child;

  @override
  State<SeqTracker> createState() => _SeqTrackerState();
}

class _SeqTrackerState extends State<SeqTracker> {
  @override
  void initState() {
    super.initState();
    widget.registry[widget.seq] = context;
  }

  @override
  void didUpdateWidget(SeqTracker old) {
    super.didUpdateWidget(old);
    if (old.seq != widget.seq) {
      if (widget.registry[old.seq] == context) widget.registry.remove(old.seq);
      widget.registry[widget.seq] = context;
    }
  }

  @override
  void dispose() {
    if (widget.registry[widget.seq] == context) widget.registry.remove(widget.seq);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
